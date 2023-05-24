import { useEffect, useRef, useState } from 'react';
import Arrow1 from './assets/arrow.svg';
import Arrow2 from './assets/dropdown-arrow.svg';
import Exit from './assets/exit.svg';
import Hamburger from './assets/hamburger.svg';
import { ActiveState } from './models/misc';
import APIKeyModal from './preferences/APIKeyModal';
import SelectDocsModal from './preferences/SelectDocsModal';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectApiKeyStatus,
  selectSelectedDocs,
  selectSelectedDocsStatus,
  selectSourceDocs,
  setSelectedDocs,
} from './preferences/preferenceSlice';
import { useOutsideAlerter } from './hooks';
import Upload from './upload/Upload';
import { Doc } from './preferences/preferenceApi';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { UserButton, useUser } from '@clerk/clerk-react';
import { updateNavigation } from './helper/getDocsHelper';
export default function Navigation({
  navState,
  setNavState,
  setIndexState,
}: {
  navState: ActiveState;
  setNavState: React.Dispatch<React.SetStateAction<ActiveState>>;
  setIndexState: React.Dispatch<React.SetStateAction<string>>;
}) {
  const dispatch = useDispatch();
  const docs = useSelector(selectSourceDocs);
  const selectedDocs = useSelector(selectSelectedDocs);

  const [isDocsListOpen, setIsDocsListOpen] = useState(false);

  const isApiKeySet = useSelector(selectApiKeyStatus);
  const [apiKeyModalState, setApiKeyModalState] =
    useState<ActiveState>('INACTIVE');

  const isSelectedDocsSet = useSelector(selectSelectedDocsStatus);
  const [selectedDocsModalState, setSelectedDocsModalState] =
    useState<ActiveState>(isSelectedDocsSet ? 'INACTIVE' : 'ACTIVE');

  const [uploadModalState, setUploadModalState] =
    useState<ActiveState>('INACTIVE');

  const navRef = useRef(null);
  const apiHost = import.meta.env.VITE_API_HOST || 'https://docsapi.arc53.com';

  const handleDeleteClick = (index: number, doc: Doc) => {
    const docPath = 'indexes/' + 'local' + '/' + doc.name;

    fetch(`${apiHost}/api/delete_old?path=${docPath}`, {
      method: 'GET',
    })
      .then(() => {
        // remove the image element from the DOM
        const imageElement = document.querySelector(
          `#img-${index}`,
        ) as HTMLElement;
        const parentElement = imageElement.parentNode as HTMLElement;
        parentElement.parentNode?.removeChild(parentElement);
      })
      .catch((error) => console.error(error));
  };

  useOutsideAlerter(
    navRef,
    () => {
      if (
        window.matchMedia('(max-width: 768px)').matches &&
        navState === 'ACTIVE' &&
        apiKeyModalState === 'INACTIVE'
      ) {
        setNavState('INACTIVE');
        setIsDocsListOpen(false);
      }
    },
    [navState, isDocsListOpen, apiKeyModalState],
  );

  /*
    Needed to fix bug where if mobile nav was closed and then window was resized to desktop, nav would still be closed but the button to open would be gone, as per #1 on issue #146
  */
  useEffect(() => {
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 768px)').matches) {
        setNavState('ACTIVE');
      } else {
        setNavState('INACTIVE');
      }
    });
  }, []);

  const { isLoaded, isSignedIn, user } = useUser();
  console.log(user?.id);
  useEffect(() => {
    const indexData = {
      user: 'local',
      activedoc: selectedDocs?.description,
    };
    updateNavigation(indexData, setIndexState);
  }, [selectedDocs]);

  useEffect(() => {
    if (uploadModalState === 'INACTIVE') {
      // console.log('INACTIVE');
    }
  }, [uploadModalState]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <>
      <div
        ref={navRef}
        className={`${
          navState === 'INACTIVE' && '-ml-96 md:-ml-[14rem]'
        } chatNavbar`}
      >
        <div className={'visible h-16 w-full border-b-2 md:hidden'}>
          <button
            className="float-right mr-5 mt-5 h-5 w-5"
            onClick={() =>
              setNavState(navState === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
            }
          >
            <img
              src={Arrow1}
              alt="menu toggle"
              className={`${
                navState === 'INACTIVE' ? 'rotate-180' : 'rotate-0'
              } m-auto w-3 transition-all duration-200`}
            />
          </button>
        </div>
        <div className="userInfo h-10 w-full">
          <div className="float-right mr-4">
            <UserButton
              showName={true}
              appearance={{
                userProfile: { elements: { breadcrumbs: 'bg-slate-500' } },
              }}
            />
          </div>
        </div>

        <div className="queryHistory mt-3 flex-grow">
          <div className="w-full border-b-2">
            <p>&nbsp;</p>
          </div>
          <p className="ml-6 mt-3 font-bold text-jet">Chat History</p>
        </div>

        <div className="chatNavigation-lower flex flex-col-reverse border-b-2">
          <div className="relative my-4 flex gap-2 px-2">
            <div
              className="mb-3 flex h-12 w-full cursor-pointer justify-between rounded-md border-2 bg-white"
              onClick={() => setIsDocsListOpen(!isDocsListOpen)}
            >
              {selectedDocs && (
                <p className="mx-4 my-3">
                  {selectedDocs.name} {selectedDocs.version}
                </p>
              )}
              <img
                src={Arrow2}
                alt="arrow"
                className={`${
                  isDocsListOpen ? 'rotate-0' : 'rotate-180'
                } mr-3 w-3 transition-all`}
              />
            </div>
            {isDocsListOpen && (
              <div className="absolute left-0 right-0 top-12 ml-2 mr-4 max-h-20 overflow-y-scroll bg-white shadow-lg">
                {docs ? (
                  docs.map((doc, index) => {
                    if (doc.model === 'openai_text-embedding-ada-002') {
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            dispatch(setSelectedDocs(doc));
                            setIsDocsListOpen(false);
                          }}
                          className="flex h-10 w-full cursor-pointer items-center justify-between border-x-2 border-b-2 hover:bg-gray-100"
                        >
                          <p className="ml-5 flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap py-3">
                            {doc.name} {doc.version}
                          </p>
                          {doc.location === 'local' ? (
                            <img
                              src={Exit}
                              alt="Exit"
                              className="mr-4 h-3 w-3 cursor-pointer hover:opacity-50"
                              id={`img-${index}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteClick(index, doc);
                              }}
                            />
                          ) : null}
                        </div>
                      );
                    }
                  })
                ) : (
                  <div className="sourceDoc-menu h-10 w-full cursor-pointer border-x-2 border-b-2 hover:bg-gray-100">
                    <p className="ml-5 py-3">No default documentation.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="mb-2font-bold ml-6 mt-3 text-jet">Source Docs</p>
        </div>
        <div className="chatNavigation-links mt-3">
          <div
            className="mx-3 my-auto flex h-10 cursor-pointer gap-4 rounded-md hover:bg-gray-200"
            onClick={() => setUploadModalState('ACTIVE')}
          >
            <div className="ml-2 mt-2 w-5">
              <FaCloudUploadAlt color="#727272" size={20} />
            </div>
            <div className="my-auto text-eerie-black">Upload</div>
          </div>
        </div>
      </div>
      <div className="fixed h-16 w-full border-b-2 bg-gray-50 md:hidden">
        <button
          className="ml-6 mt-5 h-6 w-6 md:hidden"
          onClick={() => setNavState('ACTIVE')}
        >
          <img src={Hamburger} alt="menu toggle" className="w-7" />
        </button>
      </div>
      <SelectDocsModal
        modalState={selectedDocsModalState}
        setModalState={setSelectedDocsModalState}
        isCancellable={isSelectedDocsSet}
      />
      <APIKeyModal
        modalState={apiKeyModalState}
        setModalState={setApiKeyModalState}
        isCancellable={isApiKeySet}
      />
      <Upload
        modalState={uploadModalState}
        setModalState={setUploadModalState}
      ></Upload>
    </>
  );
}
