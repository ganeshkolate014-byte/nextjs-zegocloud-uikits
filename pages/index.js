import Head from "next/head";
import { useEffect, useRef } from "react";
import config from "../lib/config";
import { randomID, getUrlParams } from "../lib/util";

export default function Home() {
  const root = useRef();

  useEffect(() => {
    if (root.current) {
      const roomID = getUrlParams().get("roomID") || (Math.floor(Math.random() * 10000) + "");
      const userID = Math.floor(Math.random() * 10000) + "";
      const userName = "User " + userID;
      const appID = config.appID;

      // Fetch token securely
      fetch("./api/token", {
        method: "post",
        body: JSON.stringify({
          userID,
          expiration: 7200,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then(async ({ token }) => {
          const { ZegoUIKitPrebuilt } = await import(
            "@zegocloud/zego-uikit-prebuilt"
          );

          const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
            appID,
            token,
            roomID,
            userID,
            userName
          );

          const zp = ZegoUIKitPrebuilt.create(kitToken);
          zp.joinRoom({
            container: root.current,
            sharedLinks: [
              {
                name: 'Personal link',
                url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + roomID,
              },
            ],
            scenario: {
              mode: ZegoUIKitPrebuilt.VideoConference,
            },

            // Google Meet-like preferences
            turnOnMicrophoneWhenJoining: true,
            turnOnCameraWhenJoining: false, // User requested OFF
            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            showScreenSharingButton: true,
            showTextChat: true,
            showUserList: true,
            maxUsers: 50,
            layout: "Grid",
            showLayoutButton: true,
            showPreJoinView: true, // Meet has a "lobby"
            branding: {
                logoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Meet_icon_%282020%29.svg/1024px-Google_Meet_icon_%282020%29.svg.png",
            },
          });
        })
        .catch(err => {
            console.error("Failed to join room:", err);
        });
    }
  }, []);

  return (
    <div className="meet-container">
      <Head>
        <title>Google Meet Clone</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <main>
        <div className="video-wrapper" ref={root}></div>
      </main>

      <style jsx>{`
        .meet-container {
          width: 100vw;
          height: 100vh;
          /* Use 100dvh for mobile browsers to account for address bar */
          height: 100dvh;
          background-color: #202124; /* Google Meet Dark Theme Background */
          color: white;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        main {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }

        .video-wrapper {
          width: 100%;
          height: 100%;
          /* Ensure Zego container fills the wrapper */
        }

        /* Adjust global styles for cleaner look */
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: 'Google Sans', Roboto, Arial, sans-serif; /* Try to use Google fonts if available, fallbacks otherwise */
          background-color: #202124;
        }

        * {
          box-sizing: border-box;
        }

        /* Custom scrollbar if needed */
        ::-webkit-scrollbar {
          width: 8px;
          background-color: #202124;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #5f6368;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
