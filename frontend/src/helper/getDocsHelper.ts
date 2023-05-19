export const handleClick = (
  event: MouseEvent,
  onLinkClicked: {
    (data: string): void;
    (data: string): void;
    (arg0: string): void;
  },
) => {
  event.preventDefault();
  const anchor = event.target as HTMLAnchorElement;
  const url = new URL(anchor.href.replace(/%5C/g, '/'));
  console.log('Path:', url.pathname);
  let path = url.pathname;
  if (path.startsWith('/')) {
    path = path.slice(1);
  }
  console.log('new path ', path);
  fetch(import.meta.env.VITE_API_HOST + '/api/get_docs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user: 'local',
      path: path,
    }),
  })
    .then(async (response) => {
      return response.text();
    })
    .then((data) => {
      console.log(data);
      onLinkClicked(data);
    })
    .catch((error) => {
      console.log('Error: ', error);
    });
};

export const updateNavigation = (
  indexData: { user: string },
  setIndexState: (arg0: string) => void,
) => {
  fetch(import.meta.env.VITE_API_HOST + '/api/get_index', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(indexData),
    mode: 'cors',
  })
    .then((res) => {
      if (res.status === 200) {
        console.log(res);
      }
      return res.json();
    })
    .then((data) => {
      const stringData = JSON.stringify(data);
      setIndexState(stringData);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};
