import * as express from 'express'
import * as mongoose from 'mongoose'
import * as config from 'config'
import authRoutes from './routes/auth.routes'
import confirmEmailRoutes from './routes/confirmEmail.routes'
import changePasswordRoutes from './routes/changePassword'
import * as path from 'path'
import * as compression from 'compression'
import for_authorized_usersRoutes from './routes/for_authorized_users.routes'

const app = express()
const PORT: number = config.get('port') || 5000
const mongoUri: string = config.get('mongoUri')

app.use(compression())

app.use(express.json())
app.use(express.urlencoded({ extended : true }))
app.use('/api/auth', authRoutes)
app.use('/api/confirmEmail', confirmEmailRoutes)
app.use('/api/recover_password', changePasswordRoutes)
app.use('/api/for_authorized_users', for_authorized_usersRoutes)

if ( process.env.NODE_ENV === 'production' ) {
    app.use(express.static(path.resolve(__dirname, 'client/build')))
    app.get('*', ( _req, res ) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
} else {
    app.use(express.static(path.resolve(__dirname, 'client')))
}

async function start(): Promise<void> {
    await mongoose.connect(mongoUri)
    app.listen(PORT, () => {
        console.log(`App has been started on port ${ PORT }...`)
    })
}

start().catch(( e ) => {
        console.log(e)
        process.exit(1)
    }
)