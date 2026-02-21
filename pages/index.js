import Head from "next/head";
import { useEffect, useRef } from "react";
import config from "../lib/config";
import { randomID, getUrlParams, getRandomName } from "../lib/util";

export default function Home() {
  const root = useRef();

  useEffect(() => {
    if (root) {
      const userID = randomID(5);
      const appID = config.appID;
      let UIKitsConfig =
        JSON.parse(
          (config.UIKitsConfig || "").replaceAll("\n", "")
            .replaceAll("\t", "")
            .replaceAll(/(\w+):/gi, '"$1":')
            .replaceAll(/,\s+\}/gi, "}")
        ) || {};
      const roomID = getUrlParams().get("roomID") || randomID(5);
      let role = getUrlParams().get("role") || "Host";
      let sharedLinks = [];
      if (UIKitsConfig && UIKitsConfig.scenario && UIKitsConfig.scenario.mode) {
        if (UIKitsConfig.scenario.mode === "OneONoneCall") {
          sharedLinks.push({
            name: "Personal link",
            url:
              window.location.origin +
              window.location.pathname +
              "?roomID=" +
              roomID,
          });
        } else if (UIKitsConfig.scenario.mode === "LiveStreaming") {
          UIKitsConfig.scenario.config.role = role;
          if (role === "Cohost" || role === "Host") {
            sharedLinks.push({
              name: "Join as co-host",
              url:
                window.location.origin +
                window.location.pathname +
                "?roomID=" +
                roomID +
                "&role=Cohost",
            });
          } else {
            UIKitsConfig = {
              scenario: UIKitsConfig.scenario,
            };
          }
          sharedLinks.push({
            name: "Join as audience",
            url:
              window.location.origin +
              window.location.pathname +
              "?roomID=" +
              roomID +
              "&role=Audience",
          });
        } else if (
          UIKitsConfig.scenario.mode === "VideoConference" ||
          UIKitsConfig.scenario.mode === "GroupCall"
        ) {
          sharedLinks.push({
            name: "Personal link",
            url:
              window.location.origin +
              window.location.pathname +
              "?roomID=" +
              roomID,
          });
        }
      }

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
            getRandomName()
          );
          const zp = ZegoUIKitPrebuilt.create(kitToken);
          zp.joinRoom({
            container: root.current,
            sharedLinks,
            ...UIKitsConfig,
          });
        });
    }
  }, []);

  return (
    <div className="app-container">
      <Head>
        <title>Discord Clone - ZEGOCLOUD</title>
        <link rel="icon" href="/favicon.ico" />
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
