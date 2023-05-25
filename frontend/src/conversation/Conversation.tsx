import { Fragment, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Hero from '../Hero';
import { AppDispatch } from '../store';
import ConversationBubble from './ConversationBubble';
import {
  addQuery,
  fetchAnswer,
  selectQueries,
  selectStatus,
  updateQuery,
} from './conversationSlice';
import Spinner from './../assets/spinner.svg';
import { FEEDBACK, Query } from './conversationModels';
import { sendFeedback } from './conversationApi';
import { IoSend } from 'react-icons/io5';
import { handleClick } from '../helper/getDocsHelper';
import { useUser } from '@clerk/clerk-react';
import '../conversation.css';
interface ConversationProps {
  onSourceDocLinkClicked: (data: string) => void;
}

export default function Conversation(props: ConversationProps) {
  const queries = useSelector(selectQueries);
  const status = useSelector(selectStatus);
  const dispatch = useDispatch<AppDispatch>();
  const endMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, user } = useUser();

  useEffect(
    () => endMessageRef?.current?.scrollIntoView({ behavior: 'smooth' }),
    [queries.length, queries[queries.length - 1]],
  );

  useEffect(() => {
    const anchors = endMessageRef?.current?.querySelectorAll('a');

    if (anchors && isSignedIn) {
      anchors.forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
          handleClick(event, props.onSourceDocLinkClicked, user.id);
        });
      });
    }

    return () => {
      if (anchors && isSignedIn) {
        anchors.forEach((anchor) => {
          anchor.removeEventListener('click', (event) => {
            handleClick(event, props.onSourceDocLinkClicked, user.id);
          });
        });
      }
    };
  }, [queries.length, queries[queries.length - 1]]);

  const handleQuestion = (question: string) => {
    dispatch(addQuery({ prompt: question }));
    if (isSignedIn) {
      const userid = user.id;
      dispatch(fetchAnswer({ question, userid }));
    }
  };

  const handleFeedback = (query: Query, feedback: FEEDBACK, index: number) => {
    const prevFeedback = query.feedback;
    dispatch(updateQuery({ index, query: { feedback } }));
    sendFeedback(query.prompt, query.response!, feedback).catch(() =>
      dispatch(updateQuery({ index, query: { feedback: prevFeedback } })),
    );
  };

  const prepResponseView = (query: Query, index: number) => {
    let responseView;
    if (query.error) {
      responseView = (
        <ConversationBubble
          ref={endMessageRef}
          className={`${index === queries.length - 1 ? 'mb-24' : 'mb-7'}`}
          key={`${index}ERROR`}
          message={query.error}
          type="ERROR"
        ></ConversationBubble>
      );
    } else if (query.response) {
      responseView = (
        <ConversationBubble
          ref={endMessageRef}
          className={`${index === queries.length - 1 ? 'mb-24' : 'mb-7'}`}
          key={`${index}ANSWER`}
          message={query.response}
          type={'ANSWER'}
          feedback={query.feedback}
          handleFeedback={(feedback: FEEDBACK) =>
            handleFeedback(query, feedback, index)
          }
        ></ConversationBubble>
      );
    }
    return responseView;
  };

  return (
    <div className="conversation-container justify-center p-4">
      {queries.length > 0 && (
        <div className="conversation mt-0 flex flex-col transition-all md:w-[100%]">
          {queries.map((query, index) => {
            return (
              <Fragment key={index}>
                <ConversationBubble
                  ref={endMessageRef}
                  className={`${
                    index === queries.length - 1 && status === 'loading'
                      ? 'mb-24'
                      : 'mb-7'
                  }`}
                  key={`${index}QUESTION`}
                  message={query.prompt}
                  type="QUESTION"
                ></ConversationBubble>
                {prepResponseView(query, index)}
              </Fragment>
            );
          })}
        </div>
      )}
      {queries.length === 0 && <Hero className="mt-24 md:mt-52"></Hero>}
      <div className="queryBar w-4/12">
        <div className="flex w-full">
          <div
            ref={inputRef}
            contentEditable
            className={`border-000000 overflow-x-hidden; max-h-24 min-h-[2.6rem] w-full overflow-y-auto whitespace-pre-wrap rounded-xl border-2 bg-white py-2 pl-4 pr-9 leading-7 opacity-100 focus:outline-none`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputRef.current?.textContent && status !== 'loading') {
                  handleQuestion(inputRef.current.textContent);
                  inputRef.current.textContent = '';
                }
              }
            }}
          ></div>
          {status === 'loading' ? (
            <img
              src={Spinner}
              className="relative bottom-[7px] right-[38px] -mr-[30px] animate-spin cursor-pointer self-end"
            ></img>
          ) : (
            <div className="relative bottom-[7px] right-[43px] -mr-[35px] h-[35px] w-[35px] cursor-pointer self-end hover:bg-gray-3000">
              <button
                className="ml-[9px] mt-[9px]"
                onClick={() => {
                  if (inputRef.current?.textContent) {
                    handleQuestion(inputRef.current.textContent);
                    inputRef.current.textContent = '';
                  }
                }}
              >
                <IoSend color="#1677FF" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
