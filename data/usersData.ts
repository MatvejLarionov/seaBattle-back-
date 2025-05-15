//в квадратных скобках стоит boolean т.е заполнен ли файл или нет. Файл заполнен если в нем 10 юзеров
import fs from 'fs'
import path from 'path'
import encryptString from '../utils/encryptString'
import { User } from '../types/user'

const fileManager = {
    directory: './data/usersJsons',
    getFileList(): string[] {
        return fs.readdirSync(this.directory).sort()
    },
    getFilesQuantity(): number {
        return this.getFileList().length
    },
    getFileNumList(): number[] {
        return this.getFileList().map(item => Number(item[0]))
    },
    getFileName(num: number): string {
        return this.getFileList()[num]
    },
    getFilePath(num: number): string {
        return path.join(this.directory, this.getFileName(num))
    },
    getFilePathByFileName(fileName: string): string {
        return path.join(this.directory, fileName)
    },

    getData(num: number): any {
        return JSON.parse(fs.readFileSync(this.getFilePath(num), "utf8"))
    },
    setData(num: number, data: any): void {
        fs.writeFileSync(this.getFilePath(num), JSON.stringify(data), "utf8")
    },

    getDataByFileName(fileName: string): any {
        return JSON.parse(fs.readFileSync(this.getFilePathByFileName(fileName), "utf8"))
    },
    setDataByFileName(fileName: string, data: any): void {
        fs.writeFileSync(this.getFilePathByFileName(fileName), JSON.stringify(data))
    },

    getAllData(): any[] {
        let data: any[] = []
        this.getFileList().forEach(item => {
            data = data.concat(this.getDataByFileName(item))
        })
        return data
    },

    createNewFile(data: any): void {
        const num = this.getFilesQuantity()
        const pathName = this.getFilePathByFileName(`${num}-1.json`)
        fs.writeFileSync(pathName, JSON.stringify(data))
    },

    lockFile(num: number): void {
        const oldPath = this.getFilePath(num)
        const newPath = this.getFilePathByFileName(`${num}-0.json`)
        fs.renameSync(oldPath, newPath)
    },
    unlockFile(num: number): void {
        const oldPath = this.getFilePath(num)
        const newPath = this.getFilePathByFileName(`${num}-1.json`)
        fs.renameSync(oldPath, newPath)
    },
    isUnLockFile(num: number): boolean {
        const fileName = this.getFileName(num)
        return fileName.split("-").at(-1)?.at(0) === "1"
    }
}
const createUserForClient = (user: User, isRemovalPassword = true): User => {
    const newUser: User = {
        login: user.login,
        password: isRemovalPassword ? undefined : user.password,
        avatar: "http://localhost:3000" + user.avatar,
        id: encryptString(user.id.toString())
    }
    return newUser
}
const usersData = {
    limitInFile: 10,
    defaultPathAvatar: "/usersAvatars/defaultAvatar.jpg",

    create(user: User): User {

        if (!user.avatar) {
            user.avatar = this.defaultPathAvatar
        }

        const nums: number[] = fileManager.getFileNumList()
        const unfullFile: number | undefined = nums.find(item => fileManager.isUnLockFile(item))
        if (unfullFile !== undefined) {
            const data: User[] = fileManager.getData(unfullFile)
            let i: number = 0
            for (; i < data.length - 1; i++) {
                if (Number(data[i + 1].id) - Number(data[i].id) > 1)
                    break
            }
            user.id = Number(data[i].id) + 1
            const index: number = user.id % this.limitInFile
            data.splice(index, 0, user)
            fileManager.setData(unfullFile, data)
            if (data.length >= this.limitInFile) {
                fileManager.lockFile(unfullFile)
            }
            return createUserForClient(user)
        } else {
            user.id = nums.length * this.limitInFile
            fileManager.createNewFile([user])
            return createUserForClient(user)
        }
    },
    read(filterParams?: { login?: string, password?: string, id?: string, avatar?: string }): User[] {
        const data: User[] = fileManager.getAllData().map(item => createUserForClient(item, false))

        if (filterParams) {
            return data.filter(item => {
                for (let i in filterParams) {
                    if (filterParams[i as keyof User] !== item[i as keyof User])
                        return false
                }
                return true
            })
        }
        return data
    },

    isLoginRepeat(login: string): boolean {
        return JSON.stringify(usersData.read({ login: login })) !== '[]'
    },

    getUserIdByEncryptString(str: string): number {
        const id = fileManager.getFilesQuantity() * this.limitInFile
        for (let i = 0; i <= id; i++) {
            if (encryptString(i.toString()) === str) {
                return i
            }
        }
        return -1
    },

    getUserById(id: number | string): User | undefined {
        id = this.getUserIdByEncryptString(id.toString())
        if (id === -1)
            return
        const fileNum = Math.floor(id / this.limitInFile)
        const data: User[] = fileManager.getData(fileNum)
        const user = data.find(item => item.id === id)
        if (!user)
            return
        return createUserForClient(user)
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

export default usersData