const express = require('express');
const Router = express.Router();
const multer  = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const {getUpload, postDeleteFile, postDownload, getLogin, getFile, postUpload, postEditFolder, getFolders, getFoldersCreate, postFoldersCreate, postLogin, getSignUp, postSignUp, getIndex, getLogout, getFoldersCreateNoId, postFoldersCreateNoId, getEditFolder, postDeleteFolder} = require('../controllers/controller')

Router.get("/", (req, res) => {
  res.redirect("/login");
})
Router.get("/folders", getIndex);
Router.get("/folders/:id", getFolders)
Router.get("/folder/create", getFoldersCreateNoId)
Router.post("/folder/create", postFoldersCreateNoId)
Router.get("/edit/:id", getEditFolder);
Router.post("/edit/:id", postEditFolder);
Router.post("/folders/delete/:id", postDeleteFolder)
Router.post("/file/delete/:id", postDeleteFile)
Router.post("/download/:id", postDownload)
Router.get("/create/:id", getFoldersCreate)
Router.post("/create/:id", postFoldersCreate)
Router.get("/login", getLogin);
Router.post("/login", postLogin);
Router.get("/files/:id", getFile);
Router.get("/sign-up", getSignUp);
Router.post("/sign-up", postSignUp)
Router.get("/logout", getLogout)
Router.post(['/upload', "/upload/:id"], upload.single('file'), postUpload)
Router.get(["/upload", "/upload/:id"], getUpload)

module.exports = Router;