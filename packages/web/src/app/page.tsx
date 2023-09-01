'use client'

import { useEffect, useState } from "react";

export default function Home() {

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadLoggedInUser = async () => {
    console.log("Checking local storage for a token");
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      console.log("Token found, fetching user")
      const userFromDb = await getUserInfo(userToken);
      if (userFromDb) {
        console.log("User fetched");
        console.log(userFromDb);
        setLoggedInUser(userFromDb);
      }
    } else {
      console.log("No token found")
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLoggedInUser();
  }, []);

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const userToken = params.get("token");
    if (userToken) {
      localStorage.setItem("userToken", userToken);
      window.location.replace(window.location.origin);
    }
  }, []);

  const getUserInfo = async (userToken: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRACAL_API_URL}/api/user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      return response.json();
    } catch (error) {
      alert(error);
    }
  };

  const signOut = async () => {
    localStorage.removeItem("userToken");
    setLoggedInUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {
        loggedInUser ? 
          <div>Welcome back {loggedInUser.givenName} (<button onClick={signOut}><u>Sign out</u></button>)</div>
          : <div>
              Please <a href="https://ehzn622uci.execute-api.eu-central-1.amazonaws.com/auth/google/authorize"><u>sign in</u></a> with Google
          </div>
      }
      <a href="https://www.strava.com/oauth/authorize?client_id=112663&response_type=code&redirect_uri=http://localhost:3000/auth/strava&approval_prompt=auto&scope=activity:read_all" target="_blank">Give StraCal permission to read your Strava data</a>
    </>
  )
}
