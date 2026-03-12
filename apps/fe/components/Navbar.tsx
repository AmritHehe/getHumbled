"use client"

import {DarkModeIcon , LightModeIcon} from "@/animatedSvgs/DarkModeIcon";
import Github from "@/animatedSvgs/Github";
import { useState } from "react";
import Container from "@/components/Container";
import Image from "next/image";
import Link from "next/link";
import { button } from "motion/react-client";



const links = [{ 
        title : "Contest",
        href : "/contests",
    },
    { 
        title : "LeaderBoard",
        href : "/leaderboard",
    }
]
export default function Navbar() {

    const [theme , setTheme ] = useState<"dark" | "light">("dark")

    function handleThemeChange (){
        const currentTheme = document.documentElement.classList.contains("dark") ? "light" : "dark"
        document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme-tailwind-playlist" , currentTheme)
        theme == "dark" ? setTheme("light") : setTheme("dark")
    }
  return (

    <div className="flex items-center justify-between w-full  bg-secondary text-textPrimary rounded-xl p-4 m-1">
   
        <h1>SkillUp</h1>
        <div>
            {links.map( (item , index )=> (<Link key={index} href={item.href}> {item.title} </Link>))}
        </div>
        <div className="flex gap-2 text-sm items-center">
            <Github/>
            {theme == "dark" ? <button onClick={handleThemeChange}> <LightModeIcon />  </button> : <button onClick={handleThemeChange} > <DarkModeIcon/> </button> }
            <Link href={"/Dashboard"} > Dashboard </Link>
            SignOut
        </div>
    </div>
  );
}
