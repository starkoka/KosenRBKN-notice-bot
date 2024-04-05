import fetch from 'node-fetch';
import jsdom from 'jsdom';
import {find,updateOrInsert} from './db.js';

const { JSDOM } = jsdom;

export async function fetchWebsite(){
    const url = "https://official-robocon.com/kosen/";
    const res = await fetch(url);
    const html = await res.text();

    console.log(html);
    const yesterdayData = await find("main","data",{date:0});
    if(yesterData.length() !== 0){
        await updateOrInsert("main","data",{date:-1},{
            date:-1,
            html:yesterdayData[0].html
        });
    }

    await updateOrInsert("main","data",{date:0},{
        date:0,
        html:html
    });
}
