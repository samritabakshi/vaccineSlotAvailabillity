require('dotenv').config()
const moment = require('moment');
const cron = require('node-cron');
const axios = require('axios');
const notifier = require('./email_notification');
/**
Step 1) Enable application access on your gmail with steps given here:
 https://support.google.com/accounts/answer/185833?p=InvalidSecondFactor&visit_id=637554658548216477-2576856839&rd=1

Step 2) Enter the details in the file .env, present in the same folder

Step 3) On your terminal run: npm i && pm2 start vaccineNotifier.js

To close the app, run: pm2 stop vaccineNotifier.js && pm2 delete vaccineNotifier.js
 */

const PINCODE = process.env.PINCODE
const EMAIL = process.env.EMAIL_USERNAME
const AGE = process.env.AGE

async function main(){
    try {
        cron.schedule('*/15 * * * *', async () => {
             await checkAvailability();
        });
    } catch (e) {
        console.log('an error occured: ' + JSON.stringify(e, null, 2));
        throw e;
    }
}

async function checkAvailability() {
    await getSlotsForDate();
   
}

function getSlotsForDate() {
    let config = {
        method: 'get',
        url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=294&date='+moment().format('DD-MM-YYYY'),
        // url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=' + PINCODE + '&date=' + DATE,
        headers: {
            'accept': 'application/json',
            'Accept-Language': 'hi_IN'
        }
    };
    let total_valid_slots =[]
    axios(config)
        .then(function (slots) {
            let centeres = slots.data.centers;
            centeres.map(center => {
                let sessions = center.sessions;
                let validSlots = {
                    "sessions" : []
                }
                let temp = sessions.filter(slot => slot.min_age_limit == 18 &&  slot.available_capacity > 2)
                // console.log(temp)
                validSlots.sessions = temp
                console.log(validSlots)
                if (validSlots.sessions.length > 0){
                    validSlots["center_name"]=center.name
                    total_valid_slots.push(validSlots) 
                }
            })
            console.log(total_valid_slots)
            if(total_valid_slots.length > 0) {
                notifyMe(total_valid_slots);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function

notifyMe(validSlots){
    let slotDetails = JSON.stringify(validSlots, null, '\t');
    notifier.sendEmail([EMAIL,"shreyans.sharma1992@gmail.com"], 'VACCINE AVAILABLE', slotDetails, (err, result) => {
        if(err) {
            console.error({err});
        }else{
            console.log(result)
        }
    })
};

main()
    .then(() => {console.log('Vaccine availability checker started.');});
