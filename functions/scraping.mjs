import fetch from 'node-fetch';
import jsdom from 'jsdom';
import {find,updateOrInsert} from './db.js';

export async function fetchWebsite(){
    const url = "https://official-robocon.com/kosen/";
    const res = await fetch(url);
    const html = await res.text();

    const yesterdayData = await find("main","data",{dataType:"today"});
    if(yesterdayData.length !== 0){
        await updateOrInsert("main","data",{dataType:"yesterday"},{
            dataType:"yesterday",
            value:yesterdayData[0].value
        });
    }

    await updateOrInsert("main","data",{dataType:"today"},{
        dataType:"today",
        value:html
    });
}
