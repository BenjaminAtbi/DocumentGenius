import DocNavigation from './DocNavigation';
import DocWindow from './DocWindow';
import Navigation from './Navigation';
import Conversation from './conversation/Conversation';
import { ActiveState } from './models/misc';
import { useState } from 'react';

export default function QueryPage() {
  const [navState, setNavState] = useState<ActiveState>(
    window.matchMedia('(min-width: 768px)').matches ? 'ACTIVE' : 'INACTIVE',
  );
  const [html, setHtml] = useState<string>('');
  const [index, setIndex] = useState<string>('');

  const handleHtmlChange = (newHtml: string) => {
    setHtml(newHtml);
  };

  return (
    <>
      <div className="wrapper">
        <div className="docNavigation">
          {/* TO DO: Change to setContentWindow or something more descriptive */}
          <DocNavigation index={index} onLinkClicked={handleHtmlChange} />
        </div>
        <div className="docWindow">
          <DocWindow html={html} onLinkClicked={handleHtmlChange}/>

        </div>
        <div className="chatWindow">
          <Conversation onLinkClicked={handleHtmlChange} />
        </div>
        <div className="chatNavigation">
          {' '}
          <Navigation
            navState={navState}
            setNavState={setNavState}
            setIndexState={setIndex}
          />
        </div>
      </div>
    </>
  );
}
