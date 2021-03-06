import * as React from 'react'
import s from './AuthPagesWrapper.module.css'
import { Outlet, useNavigate } from 'react-router-dom'

const AuthPagesWrapper: React.FC = () => {
    const navigate = useNavigate()
    const logoOnClick = () => {
        navigate('/', { replace : true })
    }
    return (
        <div className={ s.wrapper }>
            <div className={ s.content }>
                <div className={ s.company } onClick={ logoOnClick }>
                    <svg width="32" fill="none" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M31 0H9C8.447 0 8 0.447433 8 1.00097V23.9922H4C1.794 23.9922 0
    25.788 0 27.9961V30.999C0 31.5526 0.447 32 1 32H19C19.553 32 20 31.5526 20 30.999V27.9961C20 26.8921 20.897 25.9942
    22 25.9942C23.103 25.9942 24 26.8921 24 27.9961C24 30.2043 25.794 32 28 32C30.206 32 32 30.2043 32
    27.9961V1.00097C32 0.448434 31.553 0 31 0ZM18 27.9961V29.9981H2V27.9961C2 26.8921 2.897 25.9942 4
    25.9942H18.537C18.195 26.5838 18 27.2674 18 27.9961ZM14 19.9884H26V17.9864H14V19.9884ZM26
    13.9825H14V11.9806H26V13.9825ZM14 7.97673H26V5.97479H14V7.97673Z" fill='#7540EE'/>
                    </svg>
                    <h6>To Do</h6>
                </div>
                <Outlet/>
            </div>
        </div>
    )
}

export default AuthPagesWrapper