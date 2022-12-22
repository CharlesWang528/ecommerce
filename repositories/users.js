const fs = require('fs');
const crypto = require('crypto');


class UsersRepository {

    constructor(filename){
        if (!filename){
            throw new Error("Creating a repository requires a filename");
        }
        this.filename = filename;
        try {
            fs.accessSync(this.filename);
        } catch (err){
            fs.writeFileSync(this.filename, '[]');   // first write empty array because we are always working with an array of records
        }

    
    }

    async getAll(){
        //Open the file, Read and Parse and return the contents, 
        return JSON.parse(await fs.promises.readFile(this.filename, {encoding:'utf8'}));
    }

    async create(attrs){

        attrs.id = this.randomId();
        const records = await this.getAll();
        records.push(attrs);
        await this.writeAll(records)

        return attrs;

        
    }
    async writeAll(records) {
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
    }

    randomId(){
        return crypto.randomBytes(4).toString('hex');

    }

    async getOne(id){
        const records = await this.getAll();
        return records.find(record => record.id === id);
    }

    async delete(id){
        const records = await this.getAll();
        const filteredRecords = records.filter(record => record.id !== id);
        await this.writeAll(filteredRecords);
    }

    async update(id, attrs){
        const records = await this.getAll();
        const record = records.find(record => record.id === id);

        if (!record){
            throw new Error(`Record with id ${id} not found`);
        }

        Object.assign(record, attrs);
        await this.writeAll(records);
    }

    async getOneBy(filters){
        const records = await this.getAll();

        for (let record of records){
            let found = true;
            for(let key in filters){
                if (record[key] !== filters[key]){
                    found = false;
                }
            }
            if (found){
                return record;
            }

        }

    }

}

module.exports = new UsersRepository('users.json');
