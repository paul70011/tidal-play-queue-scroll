const fs = require("fs")
const path = require("path")
//const asar = require("asar")
const { exec, execSync } = require("child_process")

/*------------------------------------------------------------------------
Find directory of latest version
------------------------------------------------------------------------*/

console.log("Locating Tidal directory...")
const folderPath = path.normalize(process.env.APPDATA + "\\..\\Local\\TIDAL")

function isDirectory(fileName) {
    return fs.lstatSync(fileName).isDirectory()
}

const dirs = fs.readdirSync(folderPath).map(fileName => {
    return path.join(folderPath, fileName)
}).filter(isDirectory)
  
let appDirs = []

dirs.forEach(dir => {
    let versionNumber = dir.replace(folderPath, "").replace(/\D/g, "")
    if(versionNumber == ""){
        versionNumber = "0"
    }
    appDirs.push({dir: dir, versionNumber: parseInt(versionNumber)})
})

appDirs = appDirs.sort((a, b) => b.versionNumber - a.versionNumber)

const latestVersionDir = appDirs[0]["dir"]

/*------------------------------------------------------------------------
Unpack asar file

using https://github.com/Maks-s/asar-cpp because https://github.com/electron/asar is broken
------------------------------------------------------------------------*/

console.log("Unpacking app.asar...")
const resourcesDir = latestVersionDir + "\\resources"
/*asar.extractAll(resourcesDir + "\\app.asar", resourcesDir + "\\app")*/    //https://github.com/electron/asar
execSync("mkdir \"" + resourcesDir + "\\app\"")
execSync(".\\asar.exe --unpack -o \"" + resourcesDir + "\\app\" \"" + resourcesDir + "\\app.asar\"")
fs.rename(resourcesDir + "\\app.asar", resourcesDir + "\\app.asar.bak", err => {
    if (err) return console.log(err)
})



/*------------------------------------------------------------------------
Enable developer menu
------------------------------------------------------------------------*/

console.log("Enabling developer menu...")
const menuControllerFile = resourcesDir + "\\app\\app\\main\\menu\\MenuController.js"
fs.renameSync(menuControllerFile, menuControllerFile + ".bak", err => {
    if (err) return console.log(err)
})
fs.readFile(menuControllerFile + ".bak", "utf8", (err,data) => {
    if (err) return console.log(err)
    let modified = data.replace(/process.env.NODE_ENV === 'development'/g, "true")

    fs.writeFile(menuControllerFile, modified, 'utf8', err => {
        if (err) return console.log(err)
    })
})

/*------------------------------------------------------------------------
Append code for play queue scrolling
------------------------------------------------------------------------*/

console.log("Adding automatic play queue scrolling...")
const init_clientInterfaceFile = resourcesDir + "\\app\\app\\init_clientInterface.js"
fs.renameSync(init_clientInterfaceFile, init_clientInterfaceFile + ".bak", err => {
    if (err) return console.log(err)
})
fs.readFile(init_clientInterfaceFile + ".bak", "utf8", (err,data) => {
    if (err) return console.log(err)

    fs.readFile("playQueueScrollCode.js", "utf8", (err,dataAdd) => {
        if (err) return console.log(err)
        fs.writeFile(init_clientInterfaceFile, data + "\n" + dataAdd, 'utf8', err => {
            if (err) return console.log(err)
        })
    })
})

console.log("Done!")
console.log('Press any key to exit');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));