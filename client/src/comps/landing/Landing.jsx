import React from 'react'
import { AuroraText } from '../MagicUi/AuroraText'
import { TypingAnimation } from '../MagicUi/TypingAnimation'
import bgImg from '../../assets/bgImg.png'
import './landing.css'

const Landing = () => {
    return (
        <div
            className='bgBox relative flex flex-col justify-center items-center text-white hover:cursor-default'
            // style={{ backgroundImage: `url(${bgImg})` }}
        >
            <div className='absolute left-0 top-0 h-[100vh] w-[100vw] bg-[#0A0A0A]/85'></div>
            <div className='mainBox flex flex-col justify-center items-center bg-black/40 backdrop-blur-md border border-white/20 py-6 rounded-xl shadow-xl'>
                <div className='subBox1 flex flex-col justify-center items-center'>
                    <AuroraText className='auroraText font-bold'>
                        Website Name
                    </AuroraText>
                    <TypingAnimation className='titleDesc font-light'>
                        Inspired from that one ✉️📦 site, but for books
                    </TypingAnimation>
                </div>

                <div className='subBox2 flex flex-col justify-center items-center'>
                    <div className='lookingTxt'>
                        Looking for something?
                    </div>
                    <div className='flex justify-around items-center w-full'>
                        <input type="text" placeholder='Enter book/author' className='searchInp bg-black/30 placeholder:text-white/30 text-white rounded-bl rounded-tl' />
                        <button className='yellowBtn bg-[#FFE434] text-black rounded-br rounded-tr hover:scale-105 transition-transform duration-100 hover:cursor-pointer hover:bg-[#9a8a20] hover:text-white'>Search</button>
                    </div>
                </div>

                <div className='subBox3 flex flex-col justify-center items-center'>
                    <div className='nothingTxt'>
                        Nothing on your mind?
                    </div>
                    <button className='yellowBtn bg-[#FFE434] text-black rounded hover:scale-105 transition-transform duration-100 hover:cursor-pointer hover:bg-[#9a8a20] hover:text-white'>
                        Jump in
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Landing