const API_KEY = 'AIzaSyDW7CL-AkQRQHRO5fGHcngwXzTMpZP2PBA';
const CLIENT_ID = '851257692097-qqs73cktkbf0r6unmp2p1iegv9va88b6.apps.googleusercontent.com';

const gloAcademyList = document.querySelector('.glo-academy-list');
const trendingList = document.querySelector('.trending-list');
const musicList = document.querySelector('.music-list');
const navMenuMore = document.querySelector('.nav-menu-more');
const showMenuMore = document.querySelector('.show-more');

showMenuMore.addEventListener('click', (event) => {
	event.preventDefault();
	navMenuMore.classList.toggle('nav-menu-more-show');
});

const createCard = (dataVideo) => {
	const imgUrl = dataVideo.snippet.thumbnails.high.url;
	const videoId = typeof dataVideo.id === 'string' ? dataVideo.id : dataVideo.id.videoId;
	const titleVideo = dataVideo.snippet.title;
	const dateVideo = dataVideo.snippet.publishedAt;
	const viewCount = dataVideo.statistics?.viewCount;
	const channelTitle = dataVideo.snippet.channellTitle;

	const card = document.createElement('div');
	card.classList.add('video-card');
	card.innerHTML = `
		<div class="video-thumb">
			<a class="link-video youtube-modal" href="https://youtu.be/${videoId}">
				<img src="${imgUrl}" alt="" class="thumbnail">
			</a>
		</div>
		<h3 class="video-title">${titleVideo}</h3>
		<div class="video-info">
			<span class="video-counter">
				${viewCount ? `<span class="video-views">${viewCount} views</span>` : ''}
				<span class="video-date">${new Date(dateVideo).toLocaleString('ru-RU')}</span>
			</span>
			<span class="video-channel">${channelTitle}</span>
		</div>
	`;

	return card;
};

const createList = (warpper, listVideo) => {
	warpper.textContent = '';

	listVideo.forEach(item => {
		const card = createCard(item);
		warpper.append(card);
	});
};

// YouTubeAPI
const authBtn = document.querySelector('.auth-btn');
const userAvatar = document.querySelector('.user-avatar');

const handleSuccessAuth = data => {
	authBtn.classList.add('hide');
	userAvatar.classList.remove('hide');
	userAvatar.src = data.getImageUrl();
	userAvatar.alt = data.getName();
};

const handleNoAuth = () => {
	authBtn.classList.remove('hide');
  userAvatar.classList.add('hide');
  userAvatar.src = '';
  userAvatar.alt = '';
};

const handleAuth = () => {
	gapi.auth2.getAuthInstance().signIn();
};

// Функция для выхода из аккаунта(разлогиниться)
const handleSignOut = () => {
	gapi.auth2.getAuthInstance().signOut();
};

// Функция авторизации
const updateStatusAuth = data => {
	data.isSignedIn.listen(() => {
		updateStatusAuth(data);
	});

	if (data.isSignedIn.get()) {
		const userData = data.currentUser.get().getBasicProfile();
		handleSuccessAuth(userData)
	} else {
		handleNoAuth();
	};
};

function initClient() {
  gapi.client.init({
		'clientId': CLIENT_ID,
		'scope': 'https://www.googleapis.com/auth/youtube.readonly',
		'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
  })
	.then(() => {
		updateStatusAuth(gapi.auth2.getAuthInstance());
		authBtn.addEventListener('click', handleAuth);
    userAvatar.addEventListener('click', handleSignOut);

	})
	.then(loadScreen)
	.catch(e => {
		console.warn(e);
	})
}; 

// Делаем инициализацию
gapi.load('client:auth2', initClient);


// Работа с Youtube API - запрос чтобы просто получить 
// данные одного канала
const getChanel = () => {
	gapi.client.youtube.channels.list({
    part: 'snippet, statistics',
    id: 'UC2L7vR43LKuBXXV2AentEMw',
  }).execute((response) => {
		console.log(response);
	})
};

const requestVideos = (channelId, callback, maxResults = 6) => {
	gapi.client.youtube.search.list({
		part: 'snippet',
		channelId,
		maxResults,
		order: 'date',
	}).execute(response => {
		callback(response.items);
	});
};

const loadScreen = () => {
	requestVideos('UC2L7vR43LKuBXXV2AentEMw', data => {
		createList(gloAcademyList, data);
	});
	
  createList(trendingList, trending);
  createList(musicList, music);
};