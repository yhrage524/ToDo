import * as React from 'react'
import Loader from "../../../../Components/Loader/Loader";
import s from "./UpdatePasswordPage.module.css";
import { useState } from "react";
import { NavLink, useOutletContext, Navigate } from "react-router-dom";

interface IUseOutletContext {
    email: string,
    sendRecoveryCode: () => void,
    isLoading: boolean,
    UpdatePassword: ( password: string, RecoveryCode: string ) => void
}

const UpdatePasswordPage: React.FC = () => {
    const { email, sendRecoveryCode, isLoading, UpdatePassword } = useOutletContext() as IUseOutletContext
    const [RecoveryCode, setRecoveryCode] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [password2, setPassword2] = useState<string>('')
    const [isEqualPassword, setIsEqualPassword] = useState<boolean>(true)
    const changePasswordHandler = ( e: React.ChangeEvent<HTMLInputElement> ) => {
        if ( e.target.value !== password ) {
            setIsEqualPassword(false)
        }
        else {
            setIsEqualPassword(true)
        }
        setPassword2(e.target.value)
    }
    const onSubmitHandler = ( e: React.FormEvent<HTMLFormElement> ) => {
        e.preventDefault()
        if ( password === password2 ) {
            UpdatePassword(password, RecoveryCode)
        }
    }
    if ( !email || !email.match(/\w+@\w+\.\w+/g) )
        return <Navigate to='send_msg'/>
    return (
        <div>
            { isLoading && <Loader width={ '100%' } height={ '40%' }/> }
            <h4 className={ s.top_text }>Reset your password</h4>
            <form autoComplete='on' className={ s.form } onSubmit={ onSubmitHandler }>
                <input
                    spellCheck={ false }
                    value={ RecoveryCode }
                    onChange={ e => setRecoveryCode(e.target.value) }
                    disabled={ isLoading }
                    required
                    autoComplete='off'
                    type="text" placeholder='Recovery Code'/>
                <button className={ s.send_code_btn + ' noselect' } type='button' onClick={ sendRecoveryCode }>
                    Send code to "{ email }" again&nbsp;
                </button>
                /
                <NavLink className={ s.send_code_btn + ' noselect' } to='send_msg'>
                    &nbsp;Change email
                </NavLink>
                <input
                    spellCheck={ false }
                    value={ password }
                    onChange={ e => setPassword(e.target.value) }
                    disabled={ isLoading }
                    required
                    minLength={ 6 }
                    autoComplete='new-password'
                    type="password" placeholder='New password'/>
                <input
                    spellCheck={ false }
                    value={ password2 }
                    onChange={ changePasswordHandler }
                    disabled={ isLoading }
                    required
                    minLength={ 6 }
                    autoComplete='new-password'
                    type="password" placeholder='Confirm new password'/>
                { !isEqualPassword && <div className={ s.equal_text }>Passwords are not the same</div> }
                <button
                    className={ s.custom_btn }
                    disabled={ isLoading }
                    type='submit'
                >
                    Change password
                </button>
                <div className={s.navigate_to_login}>
                    Remembered the password?&nbsp;<NavLink className={s.navLink} to={'/../login'} replace>Login</NavLink>
                </div>
            </form>
        </div>
    )
}

export default UpdatePasswordPage