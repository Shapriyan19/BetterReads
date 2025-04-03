import dotenv from "dotenv";

dotenv.config();
token=process.env.SPOTIFY_API_KEY;

const fetchWebApi = async (endpoint,method,body)=>{
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method,
        body:JSON.stringify(body)
      });
      return await res.json();
}

export default fetchWebApi;