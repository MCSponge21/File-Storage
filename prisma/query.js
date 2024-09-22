  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient()

async function findUserById(identifier){
  const user = await prisma.user.findUnique({
    where: {
      id: identifier
    },
    include: {
      Entity: true
    }
  })
  return user;
}

async function findUserByUsername(username){
  const user = await prisma.user.findFirst({
    where: {
      username: username
    }
  })
  console.log(user);
  return user;
}

async function addUser(username, password){
  const user = await prisma.user.create({
    data: {
      username: username,
      password: password,
      Entity: {
        create: {
          name: "New Folder",
          type: 'FOLDER'
        }
      }
    }
  })
  return user;
}

async function createFolder(name, id, userid){
  const folder = await prisma.user.update({
    where:{
      id: userid
    },
    data:{
      Entity:{
        create:{
          name: name,
          type: 'FOLDER',
          parentId: id
        }
      }
    }
  })
  return folder;
}


async function createFolderNoId(name, userid){
  const folder = await prisma.user.update({
    where:{
      id: userid
    },
    data:{
      Entity:{
        create:{
          name: name,
          type: 'FOLDER',
        }
      }
    }
  })
  return folder;
}

async function findEntityById(identity){
  const entity = await prisma.entity.findFirst({
    where:{
      id: identity
    },
    include:{childEntities: true}
  })
  return entity;
}

async function editFolder(folderId, newName){
  const folder = await prisma.entity.update({
    where:{id: folderId},
    data:{
      name: newName
    }
  })
  return folder;
}

async function deleteFolder(folderId){
  await prisma.entity.delete({
    where:{id: folderId}
  })
  console.log("deleted")
}

async function getParents(folderId){
  const tree = [];
  var parentId = folderId;
  while(parentId != null){
    const folder = await prisma.entity.findFirst({
      where:{id: parentId}
    })

    tree.push({
      name: folder.name,
      id: folder.id
    });
    parentId = folder.parentId;
  }
  tree.reverse();
  tree.splice(tree.length-1,1);
  console.log(tree);
  return tree;
}

async function createFile(name, userId, size, filename, path, parentId){
  const file = await prisma.user.update({
    where:{id: userId},
    data:{
      Entity:{
        create:{
          name: name,
          type: 'FILE',
          parentId: parentId,
          size: size,
          filename: filename,
          path: path
        }
      }
    }
  })
  return file;
}

async function uploadFile(){

}

module.exports = {
    findUserById,
    findUserByUsername,
    addUser,
    findEntityById,
    createFolder,
    createFolderNoId,
    editFolder,
    deleteFolder,
    getParents,
    createFile,
    uploadFile
}