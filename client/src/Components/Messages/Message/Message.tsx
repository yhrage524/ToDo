import * as React from 'react'
import s from './Message.module.css'
import {
    deleteMessageActionCreator,
    willBeDeletedMessageActionCreator
} from "../../../store/actionsCreator/messageActionCreator";
import { useDispatch } from "react-redux";
import { Dispatch, useEffect, useState } from "react";
import { MessageAction } from "../../../types/Message";
import img from '../../../image/logo.png'

interface IMessageFC {
    messageId: number,
    isBad: boolean,
    message: string,
    willBeDeleted: boolean
}

const Message: React.FC<IMessageFC> = (
    { willBeDeleted, isBad, message, messageId } ) => {
    const dispatch = useDispatch<Dispatch<MessageAction>>()
    const [deleteStyle, setDeleteStyle] = useState<string>('')
    const deleteHandler = () => {
        dispatch(deleteMessageActionCreator(messageId))
    }
    const willBeDeleteHandeler = () => {
        dispatch(willBeDeletedMessageActionCreator(messageId))
    }
    useEffect(() => {
        if ( willBeDeleted ) {
            setDeleteStyle(s.delete + ' ')
            setTimeout(() => {
                deleteHandler()
            }, 1000)
        }
    }, [willBeDeleted])
    return (
        <div
            className={
                deleteStyle +
                (s.firstRender + ' ' ) +
                (isBad ? s.badNews : s.goodNews) + ' ' + s.message
            }>
            <img className={ s.img } src={ img } alt={ 'logo' }/>
            { message }
            <button className={ s.btn } onClick={ willBeDeleteHandeler }/>
        </div>
    )
}

export default Message