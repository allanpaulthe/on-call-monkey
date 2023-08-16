import React, { useEffect, useRef, useState } from "react";
import Avatar from "../components/Avatar";
import BotResponse from "../components/BotResponse";
import Error from "../components/Error";
import IntroSection from "../components/IntroSection";
import Loading from "../components/Loading";
import { useSearchParams } from "react-router-dom";
import {api} from '@pagerduty/pdjs';

const pd = api({token: 'u+NwexbkdzLxaPsDYWkQ'});

const Home = () => {
  const [inputPrompt, setInputPrompt] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [err, setErr] = useState(false);
  const [responseFromAPI, setReponseFromAPI] = useState(false);
  const [searchParams] = useSearchParams();
  const chatLogRef = useRef(null);

  const fetchPDData = (incident_id) => {
    if(!incident_id) return;
    pd.get(`/incidents/${incident_id}`)
    .then(({data} )=> {
      console.log(data)
      setChatLog([
        ...chatLog,
        {
          chatPrompt: `Fetch details for incident #${incident_id}`,
          botMessage: data.incident.summary,
        },
      ]);
    })
    .catch(console.error);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!responseFromAPI) {
      if (inputPrompt.trim() !== "") {
        // Set responseFromAPI to true before making the fetch request
        setReponseFromAPI(true);
        setChatLog([...chatLog, { chatPrompt: inputPrompt }]);
        callAPI();

        // hide the keyboard in mobile devices
        e.target.querySelector("input").blur();
      }

      async function callAPI() {
        try {
          const response = await fetch("/prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: inputPrompt }),
          });
          const data = await response.json();
          setChatLog([
            ...chatLog,
            {
              chatPrompt: inputPrompt,
              botMessage: data.answer,
            },
          ]);
          setErr(false);
        } catch (err) {
          setErr(err);
          console.log(err);
        }
        //  Set responseFromAPI back to false after the fetch request is complete
        setReponseFromAPI(false);
      }
    }

    setInputPrompt("");
  };

  useEffect(() => {
    fetchPDData(searchParams.get("incident_id"));
    if (chatLogRef.current) {
      chatLogRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
    return () => {};
  }, []);

  return (
    <>
      <header>
        <h1>On Call Monkey</h1>
      </header>

      <section className="chatBox">
        {chatLog.length > 0 ? (
          <div className="chatLogWrapper">
            {chatLog.length > 0 &&
              chatLog.map((chat, idx) => (
                <div
                  className="chatLog"
                  key={idx}
                  ref={chatLogRef}
                  id={`navPrompt-${chat.chatPrompt.replace(
                    /[^a-zA-Z0-9]/g,
                    "-"
                  )}`}
                >
                  <div className="chatPromptMainContainer">
                    <div className="chatPromptWrapper">
                      <Avatar bg="transparent">
                        <img
                          style={{ height: "55px", width: "55px" }}
                          src="/cat.png"
                          alt="monkey"
                        />
                      </Avatar>
                      <div id="chatPrompt">{chat.chatPrompt}</div>
                    </div>
                  </div>

                  <div className="botMessageMainContainer">
                    <div className="botMessageWrapper">
                      <Avatar bg="transparent">
                        <img
                          style={{ height: "50px", width: "50px" }}
                          src="/monkey-icon.png"
                          alt="monkey"
                        />
                      </Avatar>
                      {chat.botMessage ? (
                        <div id="botMessage">
                          <BotResponse
                            response={chat.botMessage}
                            chatLogRef={chatLogRef}
                          />
                        </div>
                      ) : err ? (
                        <Error err={err} />
                      ) : (
                        <Loading />
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <IntroSection />
        )}

        <form onSubmit={handleSubmit}>
          <div className="inputPromptWrapper">
            <input
              name="inputPrompt"
              id=""
              className="inputPrompttTextarea"
              type="text"
              rows="1"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              autoFocus
            ></input>
            <button aria-label="form submit" type="submit">
              <svg
                fill="#ADACBF"
                width={15}
                height={20}
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#212023"
                strokeWidth={0}
              >
                <title>{"submit form"}</title>
                <path
                  d="m30.669 1.665-.014-.019a.73.73 0 0 0-.16-.21h-.001c-.013-.011-.032-.005-.046-.015-.02-.016-.028-.041-.05-.055a.713.713 0 0 0-.374-.106l-.05.002h.002a.628.628 0 0 0-.095.024l.005-.001a.76.76 0 0 0-.264.067l.005-.002-27.999 16a.753.753 0 0 0 .053 1.331l.005.002 9.564 4.414v6.904a.75.75 0 0 0 1.164.625l-.003.002 6.259-4.106 9.015 4.161c.092.043.2.068.314.068H28a.75.75 0 0 0 .747-.695v-.002l2-27.999c.001-.014-.008-.025-.008-.039l.001-.032a.739.739 0 0 0-.073-.322l.002.004zm-4.174 3.202-14.716 16.82-8.143-3.758zM12.75 28.611v-4.823l4.315 1.992zm14.58.254-8.32-3.841c-.024-.015-.038-.042-.064-.054l-5.722-2.656 15.87-18.139z"
                  stroke="none"
                />
              </svg>
            </button>
          </div>
        </form>
      </section>
    </>
  );
};

export default Home;
