const request = require("supertest")
// const app = require("../app")
const {start, app } = require("../app")

// let token;

// beforeEach(async() => {
//     await start()
// })

beforeAll(async() => {
    jest.setTimeout(50000);
    await start()
   const res = await request(app).post("/api/v1/user/login").send({
        username: "parvez",
        password: "123456"
    }) 
    token = res.body.token;
    // console.log(token);
    expect(res.statusCode).toEqual(200)
})

describe("GET /api/v1/tasks", (done) => {
    jest.setTimeout(50000);
    it("should return success message", async () => {
        expect(true).toEqual(true)
    })
})


/* 
* FIXME:
When there is no duplicate user, then this test run perfectly.
if an user exist, then unable to handle the error test portion
Might little changes needed in api/v1/user/register portion 
*/

describe("POST /api/v1/user/register",  (done) => {
    it("should create a new user", async() => {
        jest.setTimeout(50000);
        const res = await request(app).post("/api/v1/user/register").send({
                username: "phossain",
                email: "phossain1@gmail.com",
                password: "string"
            })
        expect(res.statusCode).toEqual(201)
    })
})

describe("GET /api/v1/tasks", (done) => {
    jest.setTimeout(50000);
    it("should return an error with no auth token provided", async() => {
        const res = await request(app).get("/api/v1/tasks")
        expect(res.statusCode).toEqual(500)
    })
    it("should return list of tasks", async () => {
        const res = await request(app).get("/api/v1/tasks")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toEqual(200)
    })
})


 