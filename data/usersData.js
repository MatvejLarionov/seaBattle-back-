//в квадратных скобках стоит boolean т.е заполнен ли файл или нет. Файл заполнен если в нем 10 юзеров
const fs = require('fs')
const path = require('path')
const encryptString = require('../utils/encryptString')
const pathJsons = './data/usersJsons'
const fileManager = {
    directory: pathJsons,
    getFileList() {
        return fs.readdirSync(this.directory).sort()
    },
    getFilesQuantity() {
        return this.getFileList().length
    },
    getFileNumList() {
        return this.getFileList().map(item => Number(item[0]))
    },
    getFileName(num) {
        return this.getFileList()[num]
    },
    getFilePath(num) {
        return path.join(this.directory, this.getFileName(num))
    },
    getFilePathByFileName(fileName) {
        return path.join(this.directory, fileName)
    },

    getData(num) {
        return JSON.parse(fs.readFileSync(this.getFilePath(num), "utf8"))
    },
    setData(num, data) {
        fs.writeFileSync(this.getFilePath(num), JSON.stringify(data), "utf8")
    },

    getDataByFileName(fileName) {
        return JSON.parse(fs.readFileSync(this.getFilePathByFileName(fileName), "utf8"))
    },
    setDataByFileName(fileName, data) {
        fs.writeFileSync(this.getFilePathByFileName(fileName), JSON.stringify(data))
    },

    getAllData() {
        let data = []
        this.getFileList().forEach(item => {
            data = data.concat(this.getDataByFileName(item))
        })
        return data
    },

    createNewFile(data = "") {
        const num = this.getFilesQuantity()
        const pathName = this.getFilePathByFileName(`${num}-1.json`)
        fs.writeFileSync(pathName, JSON.stringify(data))
    },

    lockFile(num) {
        const oldPath = this.getFilePath(num)
        const newPath = this.getFilePathByFileName(`${num}-0.json`)
        fs.renameSync(oldPath, newPath)
    },
    unlockFile(num) {
        const oldPath = this.getFilePath(num)
        const newPath = this.getFilePathByFileName(`${num}-1.json`)
        fs.renameSync(oldPath, newPath)
    },
    isUnLockFile(num) {
        const fileName = this.getFileName(num)
        return fileName.split("-").at(-1)[0] == 1
    }
}
const usersData = {
    limitInFile: 10,
    create(user) {
        const nums = fileManager.getFileNumList()
        const unfullFile = nums.find(item => fileManager.isUnLockFile(item))
        if (unfullFile !== undefined) {
            const data = fileManager.getData(unfullFile)
            let i = 0
            for (; i < data.length - 1; i++) {
                if (data[i + 1].id - data[i].id > 1)
                    break
            }
            user.id = data[i].id + 1
            const index = user.id % this.limitInFile
            data.splice(index, 0, user)
            fileManager.setData(unfullFile, data)
            if (data.length >= this.limitInFile) {
                fileManager.lockFile(unfullFile)
            }
            user.id = encryptString(user.id)
            return user
        } else {
            user.id = nums.length * this.limitInFile
            fileManager.createNewFile([user])
            user.id = encryptString(user.id)
            return user
        }
    },
    read(filterParams) {
        const data = fileManager.getAllData().map(item => {
            item.id = encryptString(item.id)
            return item
        })

        if (filterParams) {
            return data.filter(item => {
                for (let i in filterParams) {
                    if (filterParams[i] !== item[i].toString())
                        return false
                }
                return true
            })
        }
        return data
    },

    isLoginRepeat(login) {
        return JSON.stringify(usersData.read({ login: login })) !== '[]'
    },

    getUserIdByEncryptString(str) {
        const id = fileManager.getFilesQuantity() * this.limitInFile
        for (let i = 0; i <= id; i++) {
            if (encryptString(i) === str) {
                return i
            }
        }
    },

    getUserById(id) {
        id = this.getUserIdByEncryptString(id)
        const fileNum = Math.floor(id / this.limitInFile)
        const data = fileManager.getData(fileNum)
        const user = data.find(item => item.id === id)
        user.id = encryptString(user.id)
        return user
    },

    // update(id, newData) {
    //     id = this.getUserIdByEncryptString(id)
    //     const fileNum = Math.floor(id / this.limitInFile)
    //     const data = fileManager.getData(fileNum)
    //     const index = data.findIndex(item => item.id == id)
    //     if (index === -1)
    //         return "error";
    //     if (data[index].password !== newData.oldPassword)
    //         return "passwordNotFound"
    //     if (this.isLoginRepeat(newData.login))
    //         return "loginRepeat"
    //     delete newData.oldPassword
    //     for (const key in newData) {
    //         data[index][key] = newData[key]
    //     }
    //     fileManager.setData(fileNum, data)
    // },
    // // delete(id) {
    // //     id = Number(id)
    // //     const pathFile = path.join(pathJsons, `data(${Math.floor(id / 10)}).json`)
    // //     let data = JSON.parse(fs.readFileSync(pathFile, 'utf8'))
    // //     data = JSON.stringify(data.filter(item => item.id !== id))
    // //     if (data === '[]')
    // //         fs.rmSync(pathFile)
    // //     else
    // //         fs.writeFileSync(pathFile, data)
    // // }
}

module.exports = usersData