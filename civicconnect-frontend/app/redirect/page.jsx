"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectPage(){

const { user,isLoaded } = useUser();
const router = useRouter();

useEffect(()=>{

 if(!isLoaded) return;

 router.replace("/");

},[isLoaded, router])

return <p>Redirecting...</p>;

}