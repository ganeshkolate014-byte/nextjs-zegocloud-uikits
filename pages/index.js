import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import config from "../lib/config";
import { randomID, getUrlParams, getRandomName } from "../lib/util";

export default function Home() {
  const root = useRef();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (root) {
      const roomID = getUrlParams().get("roomID") || (Math.floor(Math.random() * 10000) + "");
      const userID = Math.floor(Math.random() * 10000) + "";
      const userName = "userName" + userID;
      // Use config from env
      const appID = config.appID;

      // Fetch token from secure backend
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

            // Apply requested configuration
            turnOnMicrophoneWhenJoining: true,
            turnOnCameraWhenJoining: false, // Requested to be OFF
            showMyCameraToggleButton: false, // Requested to be OFF
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            showScreenSharingButton: true,
            showTextChat: true,
            showUserList: true,
            maxUsers: 50,
            layout: "Grid",
            showLayoutButton: true,
          });
        })
        .catch(err => {
            console.error("Failed to fetch token:", err);
        });
    }
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className={`app-container ${mobileMenuOpen ? 'menu-open' : ''}`}>
      <Head>
        <title>Discord Clone - ZEGOCLOUD</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="server-sidebar">
        <div className="server-icon active">D</div>
        <div className="server-icon">G</div>
        <div className="server-icon">P</div>
        <div className="server-icon add">+</div>
      </div>

      <div className="channel-sidebar">
        <div className="channel-header">
          <span>Discord Server</span>
          <span className="dropdown-icon">▼</span>
        </div>
        <div className="channel-category">TEXT CHANNELS</div>
        <div className="channel-item active"># general</div>
        <div className="channel-item"># rules</div>
        <div className="channel-item"># announcements</div>

        <div className="channel-category">VOICE CHANNELS</div>
        <div className="channel-item voice">🔊 General</div>
        <div className="channel-item voice">🔊 Gaming</div>

        <div className="user-profile">
           <div className="avatar">U</div>
           <div className="user-info">
             <div className="username">User</div>
             <div className="discriminator">#1234</div>
           </div>
        </div>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <div className="hamburger" onClick={toggleMobileMenu}>
             ☰
          </div>
          <div className="channel-title">
            <span className="hashtag">#</span> general
          </div>
          <div className="top-icons">
             <span>🔔</span>
             <span>📌</span>
             <span>👥</span>
             <input type="text" placeholder="Search" className="search-bar" />
          </div>
        </div>
        <div className="content-area">
           <div className="videoContainer" ref={root}></div>
        </div>
      </div>

      <style jsx>{`
        .app-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          background-color: #36393f;
          color: #dcddde;
          overflow: hidden;
        }

        /* Server Sidebar */
        .server-sidebar {
          width: 72px;
          background-color: #202225;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 12px;
          overflow-y: auto;
          flex-shrink: 0;
        }

        .server-icon {
          width: 48px;
          height: 48px;
          background-color: #36393f;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 8px;
          cursor: pointer;
          transition: border-radius 0.2s, background-color 0.2s;
          color: #dcddde;
          font-weight: bold;
        }

        .server-icon:hover, .server-icon.active {
          border-radius: 16px;
          background-color: #5865f2;
          color: white;
        }

        .server-icon.add {
          color: #3ba55c;
          background-color: #36393f;
        }

        .server-icon.add:hover {
           background-color: #3ba55c;
           color: white;
        }

        /* Channel Sidebar */
        .channel-sidebar {
          width: 240px;
          background-color: #2f3136;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .channel-header {
          height: 48px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: bold;
          color: white;
          box-shadow: 0 1px 0 rgba(4,4,5,0.2);
          cursor: pointer;
        }

        .channel-header:hover {
           background-color: #34373c;
        }

        .channel-category {
          padding: 18px 16px 4px 18px;
          font-size: 12px;
          font-weight: bold;
          color: #8e9297;
        }

        .channel-category:hover {
           color: #dcddde;
        }

        .channel-item {
          margin: 1px 8px;
          padding: 6px 8px;
          border-radius: 4px;
          cursor: pointer;
          color: #8e9297;
          font-weight: 500;
        }

        .channel-item:hover {
          background-color: #34373c; /* Slightly lighter than sidebar */
          color: #dcddde;
        }

        .channel-item.active {
          background-color: #393c43;
          color: white;
        }

        .user-profile {
           margin-top: auto;
           height: 52px;
           background-color: #292b2f;
           padding: 0 8px;
           display: flex;
           align-items: center;
        }

        .avatar {
           width: 32px;
           height: 32px;
           border-radius: 50%;
           background-color: #5865f2;
           display: flex;
           justify-content: center;
           align-items: center;
           color: white;
           margin-right: 8px;
        }

        .user-info {
           font-size: 14px;
        }

        .username {
           font-weight: bold;
           color: white;
        }

        .discriminator {
           font-size: 12px;
           color: #b9bbbe;
        }


        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #36393f;
          min-width: 0; /* Important for flex container to not overflow */
        }

        .top-bar {
          height: 48px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 0 rgba(4,4,5,0.2);
          background-color: #36393f;
          position: relative;
          z-index: 10;
        }

        .hamburger {
           display: none;
           font-size: 24px;
           margin-right: 16px;
           cursor: pointer;
           user-select: none;
           z-index: 20;
        }

        .channel-title {
           font-weight: bold;
           color: white;
           display: flex;
           align-items: center;
        }

        .hashtag {
           color: #8e9297;
           margin-right: 8px;
           font-size: 20px;
        }

        .top-icons {
           display: flex;
           align-items: center;
           gap: 16px;
           color: #b9bbbe;
        }

        .search-bar {
           background-color: #202225;
           border: none;
           border-radius: 4px;
           padding: 4px 8px;
           color: #dcddde;
           height: 24px;
           width: 144px;
           transition: width 0.2s;
        }

        .search-bar:focus {
           width: 240px;
           outline: none;
        }


        .content-area {
          flex: 1;
          position: relative;
          background-color: #36393f;
          display: flex;
          flex-direction: column;
        }

        .videoContainer {
          width: 100%;
          height: 100%;
          flex: 1;
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
           .server-sidebar, .channel-sidebar {
              display: none;
           }

           .app-container.menu-open .server-sidebar,
           .app-container.menu-open .channel-sidebar {
              display: flex;
              position: absolute;
              height: 100%;
              z-index: 100;
           }

           .app-container.menu-open .channel-sidebar {
              left: 72px;
              box-shadow: 2px 0 5px rgba(0,0,0,0.5);
           }

           .hamburger {
              display: block;
           }

           .search-bar {
              display: none;
           }

           .top-icons span:not(:last-child) {
              display: none; /* Hide most icons on mobile */
           }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #36393f;
        }

        * {
          box-sizing: border-box;
        }

        /* Custom scrollbar for Webkit */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
          background-color: #2f3136;
        }

        ::-webkit-scrollbar-thumb {
          background-color: #202225;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
