import fetch from 'node-fetch';
import {find,updateOrInsert} from './db.js';
import {generate} from './diffpage.js';

export async function fetchWebsite(){
    try{
        const url = "https://official-robocon.com/kosen/";
        const res = await fetch(url);
        const html = await res.text();

        const beforeData = await find("main","data",{dataType:"before"});
        if(beforeData.length !== 0){
            if(beforeData[0].value !== html){
                await updateOrInsert("main","data",{dataType:"yesterday"},{
                    dataType:"yesterday",
                    value:beforeData[0].value
                });
            }
            else{
                return false;
            }
        }

        generate(beforeData[0].value,html);

        await updateOrInsert("main","data",{dataType:"before"},{
            dataType:"before",
            value:html,
            date:new Date().toLocaleString()
        });
        return true;
    }
    catch{}
}
