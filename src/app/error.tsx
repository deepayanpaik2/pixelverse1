'use client';
export default function Error({error,reset}:{error:Error;reset:()=>void}){return <div className="p-8 text-white"><h1 className="text-2xl font-bold">Something went wrong</h1><button onClick={reset} className="mt-2 px-3 py-1 bg-arcade-champagne text-black rounded">Retry</button></div>}
