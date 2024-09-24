const passport = require('passport');
const bcrypt = require('bcryptjs');
const supabase = require('../storage/supabase');
const Stream = require('stream');
require('dotenv').config();
const {addUser, deleteFolder, getParents, createFile, findUserByUsername, findEntityById, createFolder, createFolderNoId, editFolder} = require('../prisma/query')

function getIndex(req, res){
    res.render("index", {user: req.user});
}

async function getFolders(req, res){
    const folder = await findEntityById(parseInt(req.params.id));
    const parents  = await getParents(parseInt(req.params.id));
    if(!req.user){
        res.send("LOG IN!")
    }else if(req.user.id != folder.userId){
        res.send("Not your folder!");
    }
    res.render("folders", {user: req.user, folder: folder, parents: parents});
}

async function getFoldersCreate(req, res){
    const folder = await findEntityById(parseInt(req.params.id));
    if(!req.user){
        res.send("LOG IN!")
    }else if(req.user.id != folder.userId){
        res.send("Not your folder!");
    }
    res.render("createFolder", {folder: folder});
}

async function getFoldersCreateNoId(req, res){
    if(!req.user){
        res.send("LOG IN!")
    }
    res.render("createFolderNoId");
}

async function postFoldersCreate(req, res){
    await createFolder(req.body.foldername, parseInt(req.params.id), req.user.id);
    res.redirect(`/folders/${req.params.id}`);
}

async function postFoldersCreateNoId(req, res){
    console.log(req.body.foldername);
    await createFolderNoId(req.body.foldername, req.user.id);
    res.redirect("/folders");
}

function getLogin(req, res){
    res.render("log-in", {message: null});
}

function postLogin(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if(!user){
        console.log(info);
        res.render('log-in', {message: info.message});
      }else{
        req.login(user, function(err){
            return res.redirect("/folders");
        })
      }
    })(req, res, next);
}

function getSignUp(req, res){
    const errors = [];
    res.render('sign-up', {errors: errors});
};

async function postSignUp(req, res){
    const {username, password, confirmpassword} = req.body;
    const errors = [];
    const user = await findUserByUsername(username);

    if (!username || !password || !confirmpassword) {
        errors.push({ msg: 'Please fill in all fields' });
    }
    if (password !== confirmpassword) {
        errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }
    if(user != null){
        errors.push({msg: "Username is already taken"})
    }

    if (errors.length > 0) {
        res.render('sign-up', {
            errors: errors,
            username: username,
            password: password,
            confirmpassword: confirmpassword
        });

        console.log(errors);
    } else {
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
            console.log(hashedPassword);
            await addUser(req.body.username, hashedPassword);
        });
        res.redirect('/login');
    }

    
};

function getLogout(req, res, next){
    req.logout((err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/login");
      });
};

async function getEditFolder(req, res) {
    const folder = await findEntityById(parseInt(req.params.id));
    if(!req.user){
        res.send("LOG IN!")
    }else if(req.user.id != folder.userId){
        res.send("Not your folder!");
    }
    res.render("editFolder", {folder: folder});
}

async function postEditFolder(req, res){
    const folder = await editFolder(parseInt(req.params.id), req.body.foldername);
    console.log(folder);
    if(folder.parentId == null){
        res.redirect('/folders');
    }else{
        res.redirect(`/folders/${folder.parentId}`);
    }
}

async function postDeleteFolder(req, res){
    const folder = await findEntityById(parseInt(req.params.id));
    await deleteFolder(parseInt(req.params.id));
    if(folder.parentId == null){
        res.redirect('/folders');
    }else{
        res.redirect(`/folders/${folder.parentId}`);
    }
}

async function getUpload(req, res, next){
    const folder = await findEntityById(parseInt(req.params.id));
    if(!req.user){
        res.send("LOG IN!")
    }else if(req.user.id != folder.userId){
        res.send("Not your folder!");
    }else{
        res.render("upload", {req: req});
    }
}

async function postUpload(req, res, next){
        const id = req.params.id;
        const folder = await findEntityById(parseInt(id));
        console.log(folder);
        console.log(id);
        console.log(req.user.id);

        if(folder.userId == req.user.id){
            const bufferStream = new Stream.Readable()
        const file = req.file;
        const { originalname, size, buffer, path, filename } = file;
        bufferStream.push(buffer);
        bufferStream.push(null); //end of stream

        const { data, error } = await supabase.storage.from(process.env.BUCKET_NAME)
        .upload(`public/${req.user.id}/${originalname}`, bufferStream, {
            duplex: 'half'
        })

        if (error) {
            res.send(error)
            return null;
        } else {
        console.log(data);
        await createFile(originalname, req.user.id, size, filename, path, parseInt(req.params.id));
        console.log(req.file);
        if(id == null){
            res.redirect('/folders');
        }else{
            const folder = await findEntityById(parseInt(id));
            res.redirect(`/folders/${folder.id}`);
        }
        }
        }else{
            res.send("not your file");
        }
        
}

async function getFile(req, res){
    const file = await findEntityById(parseInt(req.params.id));
    if(!req.user){
        res.send("LOG IN!")
    }else if(req.user.id != file.userId){
        res.send("Not your file!");
    }
    console.log(file)
    res.render("file", {file: file});
}

async function postDownload(req, res, next){
        const file = await findEntityById(parseInt(req.params.id));
        const path = `public/${req.user.id}/${file.name}`;

        const {data, error} = await supabase.storage.from(process.env.BUCKET_NAME)
        .createSignedUrl(path, 60, {download: true});

        if(!error){
            res.redirect(data.signedUrl);
        }else{
            console.log(error);
        }

}

async function postDeleteFile(req, res, next) {
        const file = await findEntityById(parseInt(req.params.id));
        const path = `public/${req.user.id}/${file.name}`;

        const {data, error} = await supabase.storage.from(process.env.BUCKET_NAME)
        .remove(path);

        if(error){
            console.log(error);
        }else{
            await deleteFolder(parseInt(req.params.id));
            if(file.parentId == null){
                res.redirect('/folders');
            }else{
                res.redirect(`/folders/${file.parentId}`);
            }
        }
}

module.exports = {
    getIndex,
    getLogin,
    getSignUp,
    postSignUp,
    getLogout,
    getFolders,
    getFoldersCreate,
    postFoldersCreate,
    getFoldersCreateNoId,
    postFoldersCreateNoId,
    getEditFolder,
    postEditFolder,
    postDeleteFolder,
    postUpload,
    getFile,
    postDownload,
    postDeleteFile,
    postLogin,
    getUpload
}