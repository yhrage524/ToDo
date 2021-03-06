import express, { Router } from 'express'
import { check, validationResult } from 'express-validator'
import { UserModel } from '../models/User'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import * as config from 'config'
import * as shortid from 'shortid'
import auth from '../middleware/auth'
import * as nodemailer from 'nodemailer'
import { deleteReqBody, loginReq, registerReq } from '../types/auth.routes'
import { AuthMwResLocals } from '../types/auth.mw'
import { StepModel } from '../models/Step'
import { TaskModel } from '../models/Task'
import { ListModel } from '../models/List'
import { GroupModel } from '../models/Group'

const router = Router()
const jwtToken: string = config.get('jwtSecret')
const expiresIn: string = config.get('jwtExpiresIn')

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : config.get('email'),
        pass : config.get('password')
    },
    from : config.get('email')
})

router.post('/register',
    check('email', 'Incorrect email').isEmail().normalizeEmail(),
    check('password', 'Password must be at least 6 characters and no more than 18 characters')
        .isLength({ min : 6, max : 18 }),
    check('username', 'Username must be at least 5 characters and no more than 18 characters')
        .isLength({ min : 5, max : 18 }),
    check('Timezone').exists(),
    async ( req: express.Request<any, any, registerReq>, res ) => {
        try {
            const errors = validationResult(req)
            if ( !errors.isEmpty() ) {
                return res.status(400).json(
                    { errors : errors.array(), message : 'Invalid data at registration.' }
                )
            }

            const { email, password, username, Timezone } = req.body
            const candidate = await UserModel.findOne({ email : email })
            if ( candidate ) {
                return res.status(400).json({ message : 'User already exist.' })
            }

            const hashedPassword = await bcrypt.hash(password, 12)
            console.log(password, hashedPassword)
            const ConfirmEmail = shortid.generate()
            const user = new UserModel({
                email,
                password : hashedPassword,
                RecoveryCode : null,
                username,
                Timezone,
                ConfirmEmail
            })

            const confirmEmailUrl = `${ config.get('baseUrl') }/api/confirmEmail/${ ConfirmEmail }`
            transporter.sendMail({
                from : config.get('email'),
                to : email,
                subject : 'Organizer project - Confirm email',
                text : `Click on this link to confirm email ${ confirmEmailUrl }`,
                html : `<div>Click on this 
                            <b><a href="${ confirmEmailUrl }">link</a></b>
                            to confirm email
                        </div>`
            }).then(() => res.status(200))
            const token = jwt.sign(
                { userId : user?._id },
                jwtToken,
                { expiresIn }
            )

            await user.save()

            return res.status(201).json(
                {
                    token,
                    username,
                    Timezone,
                    message : 'User created.',
                    emailConfirmed : user.ConfirmEmail === 'true',
                    email
                }
            )
        } catch (e) {
            return res.status(500).json({ message : e.message })
        }
    }
)

router.post('/login/form',
    check('email').normalizeEmail(),
    check('password').exists(),
    async ( req: express.Request<any, any, loginReq>, res ) => {
        try {
            const errors = validationResult(req)
            if ( !errors.isEmpty() ) {
                return res.status(400).json(
                    { errors : errors.array(), message : 'Invalid login data.' }
                )
            }

            const user = await UserModel.findOne({ email : req.body.email })

            if ( !user ) {
                return res.status(400).json({ message : 'User not found.' })
            }

            const isMatch = await bcrypt.compare(req.body.password, user.password)
            console.log(req.body.password, user.password, isMatch)
            if ( !isMatch ) return res.status(400).json({ message : 'User not found.' })

            if ( user.ConfirmEmail && typeof user.ConfirmEmail === 'string' ) {
                const confirmEmailUrl = `${ config.get('baseUrl') }/api/confirmEmail/${ user.ConfirmEmail }`
                await transporter.sendMail({
                    from : config.get('email'),
                    to : user.email,
                    subject : 'Organizer project - Confirm email',
                    text : `Click on this link to confirm email ${ confirmEmailUrl }`,
                    html : `<div>Click on this 
                                <b><a href="${ confirmEmailUrl }">link</a></b>
                                to confirm email
                            </div>`
                })
            }

            const token = jwt.sign(
                { userId : user?.id },
                jwtToken,
                { expiresIn }
            )

            return res.status(200).json(
                {
                    token,
                    Timezone : user.Timezone,
                    username : user.username,
                    emailConfirmed : user.ConfirmEmail === 'true',
                    email : user.email
                }
            )
        } catch (e) {
            return res.status(500).json({ message : 'Try again later...' })
        }
    }
)

router.post('/login/jwt', auth,
    async ( _req,
        res: express.Response<any, AuthMwResLocals> ) => {
        try {
            const user = await UserModel.findById(res.locals.userId)
            if ( !user ) return res.status(400).json({ message : 'User not found.' })

            if ( user.ConfirmEmail && typeof JSON.parse(user.ConfirmEmail) == 'string' ) {
                const confirmEmailUrl = `${ config.get('baseUrl') }/api/confirmEmail/${ user.ConfirmEmail }`
                await transporter.sendMail({
                    from : config.get('email'),
                    to : user.email,
                    subject : 'Organizer project - Confirm email',
                    text : `Click on this link to confirm email ${ confirmEmailUrl }`,
                    html : `<div>Click on this 
                                <b><a href="${ confirmEmailUrl }">link</a></b>
                                to confirm email
                            </div>`
                })
            }
            const token = jwt.sign(
                { userId : res.locals.userId },
                jwtToken,
                { expiresIn }
            )

            return res.status(200).json({
                token,
                username : user.username,
                Timezone : user.Timezone,
                emailConfirmed : user.ConfirmEmail === 'true',
                email : user.email
            })
        } catch (e) {
            return res.status(500).json({ message : 'Try again later...' })
        }
    }
)

router.delete('/user',
    auth,
    check('password').exists(),
    async ( req: express.Request<any, any, deleteReqBody>,
        res: express.Response<any, AuthMwResLocals> ) => {
        try {
            const errors = validationResult(req)
            if ( !errors.isEmpty() ) {
                return res.status(400).json(
                    { errors : errors.array(), message : 'Invalid data.' }
                )
            }

            const user = await UserModel.findById(res.locals.userId)
            if ( !user ) return res.status(400).json({ message : 'User not found.' })

            const isMatch = await bcrypt.compare(req.body.password, user.password)
            if ( !isMatch ) return res.status(400).json({ message : 'Wrong password.' })

            const steps = await StepModel.find({ owner : res.locals.userId })
            const tasks = await TaskModel.find({ owner : res.locals.userId })
            const lists = await ListModel.find({ owner : res.locals.userId })
            const groups = await GroupModel.find({ owner : res.locals.userId })

            for ( const step of steps ) {
                await step.delete()
            }

            for ( const task of tasks ) {
                await task.delete()
            }

            for ( const list of lists ) {
                await list.delete()
            }

            for ( const group of groups ) {
                await group.delete()
            }

            await user.delete()

            return res.status(201).json({ message : 'User deleted.' })
        } catch (e) {
            return res.status(500).json({ message : 'Try again later...' })
        }
    }
)

export default router