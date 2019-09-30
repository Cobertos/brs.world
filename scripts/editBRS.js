const BRS = require("brs-js");
const fs = require("fs");
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//Make sure to call rl.close() when done!
const rlq = (...args)=>{
  return new Promise((resolve, reject)=>{
    rl.question(...args, (ans)=>{
        resolve(ans);
    });
  });
}

(async function main(){
    const brs = BRS.read(fs.readFileSync(process.argv[2]));
    brs.map = (await rlq(`>>Map [${brs.map}]: `)) || brs.map;
    brs.author.id = (await rlq(`>>AID [${brs.author.id}]: `)) || brs.author.id;
    brs.author.name = (await rlq(`>>ANAME [${brs.author.name}]: `)) || brs.author.name;
    brs.description = (await rlq(`>>Desc [${brs.description}]: `)) || brs.description;
    rl.close();
    fs.writeFileSync(process.argv[2] + '_new', new Uint8Array(BRS.write(brs)));
})();