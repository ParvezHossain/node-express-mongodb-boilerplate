const moment = require("moment")
const redis = require("redis")

// ref => https://www.section.io/engineering-education/nodejs-rate-limiting/


const redis_client = redis.createClient()

const WINDOW_DURATION_IN_HOURS = 24;
const MAX_WINDOW_REQUEST_COUNT = 100;
const WINDOW_LOG_DURATION_IN_HOURS = 1; 

const customLimiter = (req, res, next) => {
    try {
        if (!redis_client) {
            console.log("redis client does not exist");
            process.exit(1)
        }

        redis_client.get(req.ip, function(error, record) {
            if (error) throw error
            const currentTime = moment()
            if (record == null) {
                let newRecord = []
                let requestLog = {
                    requestTimeStamp: currentTime.unix(),
                    requestCount: 1
                };
                newRecord.push(requestLog)
                redis_client.set(req.ip, JSON.stringify(newRecord))
                next()
            }


            let data = JSON.parse(record)
            let windowBeginTimestamp = moment()
                .subtract(WINDOW_DURATION_IN_HOURS, 'hours')
                .unix()

            let requestsinWindow = data.filter(entry => {
                return entry.requestTimeStamp > windowBeginTimestamp
            })
            console.log('requestsinWindow', requestsinWindow);

            let totalWindowRequestsCount = requestsinWindow.reduce((accumulator, entry) => {
                return accumulator + entry.requestCount;
            }, 0)


            //if maximum number of requests is exceeded then an error is returned
            if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
                res
                    .status(429)
                    .jsend.error(
                    `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_DURATION_IN_HOURS} hrs limit!`
                );
            } else {
                //When the number of requests made are less than the maximum the a new entry is logged
                let lastRequestLog = data[data.length - 1];
                let potentialCurrentWindowIntervalStartTimeStamp = currentTime
                    .subtract(WINDOW_LOG_DURATION_IN_HOURS, 'hours')
                    .unix();
                //When the interval has not passed from the last request, then the counter increments
                if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
                    lastRequestLog.requestCount++;
                    data[data.length - 1] = lastRequestLog;
                } else {
                    //When the interval has passed, a new entry for current user and timestamp is logged
                    data.push({
                        requestTimeStamp: currentTime.unix(),
                        requestCount: 1
                    });
                }
                redis_client.set(req.ip, JSON.stringify(data));
                next();
            }



        })
    } catch (error) {
        next(error)
    }
}

module.exports = customLimiter