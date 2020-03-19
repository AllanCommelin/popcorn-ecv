/* 
Attendre le chargement du DOM
*/

document.addEventListener('DOMContentLoaded', () => {

    /* 
    Déclarations
    */
    const searchForm = document.querySelector('#searchForm');
    const searchLabel = document.querySelector('#searchForm span');
    const searchData = document.querySelector('[name="searchData"]');
    const themoviedbUrl = 'https://api.themoviedb.org/3/search/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&query=';
    const movieList = document.querySelector('#movieList');
    const moviePopin = document.querySelector('#moviePopin article');
    const formPopup = document.querySelector('#formPopup');
    /*
    Register form
     */
    const registerURL = 'https://api.dwsapp.io/api/register';
    const registerForm = document.querySelector('#registerForm');
    const emailRegister = document.querySelector('#registerForm [name="email"]');
    const pseudoRegister = document.querySelector('#registerForm [name="pseudo"]');
    const passwordRegister = document.querySelector('#registerForm [name="password"]');
    /*
    Login form
     */
    const loginURL = 'https://api.dwsapp.io/api/login';
    const loginForm = document.querySelector('#loginForm');
    const emailLogin = document.querySelector('#loginForm [name="email"]');
    const passwordLogin = document.querySelector('#loginForm [name="password"]');
    /*
    User
     */
    const favURL = 'https://api.dwsapp.io/api/favorite';
    const userURL = 'https://api.dwsapp.io/api/me';
    const profileContent = document.querySelector('#profileContent');
    let favList = [];


    const btnFormPupup = document.querySelector('#btnFormPupup');


    /* 
    Fonctions
    */
    const getUserInfos = () => {
        if(localStorage.getItem("userId")) {
            fetchData({
                url: userURL+'/'+localStorage.getItem("userId"),
                method: 'GET'
            })
        } else {
            formPopup.classList.remove('close');
            formPopup.classList.add('open');
            document.querySelector('#closeFormPopup').addEventListener('click', function () {
                if(formPopup.classList.contains("close")) {
                    formPopup.parentElement.classList.remove('close');
                    formPopup.parentElement.classList.add('open');
                } else {
                    formPopup.parentElement.classList.add('close');
                    formPopup.parentElement.classList.remove('open');
                }
            })
        }
    }

    const getFavoritesList = collection => {
        //Reset des favoris
        profileContent.innerHTML = '';
        favList = [];
        for (let i = 0; i < collection.length; i++) {
            favList.push(collection[i].id);
            fetchFunction(parseInt(collection[i].id), true)
        }
    };
    
    const displayFavoritesList = (movie) => {
        profileContent.innerHTML += `
            <article class="favorite" id="fav-${movie.id}" movie-id="${movie.id}">
                <i class="far fa-bookmark"></i> ${movie.title}
            </article>
        `;
    };

    const displayContent = (content, active) => {
        if(active) {
            content.classList.remove('close');
            content.classList.add('active');
        } else {
            content.classList.remove('active');
            content.classList.add('close');
        }
    };

    const displayError = (tag, msg) => {
        searchLabel.textContent = msg;
        tag.addEventListener('focus', () => searchLabel.textContent = '');
    };

    const validRegisterForm = () => {
        registerForm.addEventListener('submit', event => {
            event.preventDefault();
            if (emailRegister.value.length > 2 && pseudoRegister.value.length > 2 && passwordRegister.value.length > 2) {
                fetchData({
                    url: registerURL,
                    method: "POST",
                    data: {
                        'email': emailRegister.value,
                        'password': passwordRegister.value,
                        'pseudo': pseudoRegister.value
                    }
                })
            } else {
                console.log('Une erreur est survenue !')
            }
        })
    };

    const validLoginForm = () => {
        loginForm.addEventListener('submit', event => {
            event.preventDefault();
            if (emailLogin.value.length > 2 && passwordLogin.value.length > 2) {
                fetchData({
                    url: loginURL,
                    method: "POST",
                    data: {
                        'email': emailLogin.value,
                        'password': passwordLogin.value,
                    }
                })
                // Close the popup
                document.querySelector('#closeFormPopup').parentElement.parentElement.parentElement.classList.add('close');
            } else {
                console.log('Une erreur est survenue !')
            }
        })
    };

    const getSearchSumbit = () => {
        searchForm.addEventListener('submit', event => {
            // Stop event propagation
            event.preventDefault();

            // Check form data
            searchData.value.length > 0
                ? fetchFunction(searchData.value)
                : displayError(searchData, 'Minimum 1 caractère');
        });
    };

    /*
    Fetch to socket server
     */
    const fetchData = (fetchConfig) => {
        let obj;
        if(fetchConfig.method ==='GET' || fetchConfig.method ==='DELETE'){
            obj = {
                method: fetchConfig.method,
                headers: {'Content-Type': 'application/json'}
            }
        } else {
            obj = {
                method: fetchConfig.method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(fetchConfig.data)
            }
        }
        fetch(fetchConfig.url, obj)
            .then(response => {
                return response.json()
            })
            .then(jsonData => {
                if(jsonData.message.includes('Favorite created')) {
                    // To update favorites if new favorite was created
                    getUserInfos()
                }
                if(jsonData.data) {
                    if(!localStorage.getItem("userId") && jsonData.data['identity']) {
                        localStorage.setItem("userId",jsonData.data.identity._id)
                    }
                    if(jsonData.data['favorite']) getFavoritesList(jsonData.data.favorite)
                }
            })
            .catch(err => console.error(err));
    };

    const initPopupForm = () => {
        btnFormPupup.addEventListener('click', () => {
            formPopup.classList.remove('close');
            formPopup.classList.add('open');
        })
        document.querySelector('#closeFormPopup').addEventListener('click', () => {
            if(formPopup.classList.contains("close")){
                formPopup.classList.remove('close');
                formPopup.classList.add('open');
            } else {
                formPopup.classList.add('close');
                formPopup.classList.remove('open');
            }
        })
    }


    /*
    Fetch to Themoviedb
     */
    const fetchFunction = (keywords, favorite = false , index = 1) => {
        let fetchUrl = null;
        typeof keywords === 'number'
            ? fetchUrl = `https://api.themoviedb.org/3/movie/${keywords}?api_key=6fd32a8aef5f85cabc50cbec6a47f92f`
            : fetchUrl = themoviedbUrl + keywords + '&page=' + index
        fetch(fetchUrl)
            .then(response => response.ok ? response.json() : 'Response not OK')
            .then(jsonData => {
                if(favorite){
                    displayFavoritesList(jsonData)
                    getPopinLink(document.querySelectorAll('.favorite'))
                } else {
                    typeof keywords === 'number' ? displayPopin(jsonData) : displayMovieList(jsonData.results)
                }
            })
            .catch(err => console.error(err));
    };

    const displayMovieList = collection => {
        searchData.value = '';
        movieList.innerHTML = '';
        for (let i = 0; i < collection.length; i++) {
            movieList.innerHTML += `
                    <article>
                        <figure>
                            <img src="https://image.tmdb.org/t/p/w500/${collection[i].poster_path}" alt="${collection[i].original_title}">
                            <figcaption movie-id="${collection[i].id}">
                                ${collection[i].original_title} (voir plus...)
                            </figcaption>
                        </figure>
                        <div class="overview">
                            <div>
                                <p>${collection[i].overview}</p>
                                <button>Voir le film</button>
                            </div>
                        </div>
                    </article>
                `;
        };
        getPopinLink(document.querySelectorAll('figcaption'));
    };

    const getPopinLink = linkCollection => {
        for (let link of linkCollection) {
            link.addEventListener('click', () => {
                // +var = parseInt(var) || parseFloat(var)
                fetchFunction(+link.getAttribute('movie-id'));
            });
        }
        ;
    };

    const displayPopin = data => {
        moviePopin.innerHTML = `
                <div class="movie-img">
                    <img src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="${data.original_title}">
                </div>
                <div class="movie-details">
                    <div class="resume">
                        <h2>${data.original_title}</h2>
                        <p>${data.overview}</p>
                    </div>      
                    <div class="actions">
                        <button>Voir en streaming</button>
                        ${ 
                            favList.includes(data.id.toString()) ? 
                            `<button id="deleteFavorite" movie-id="${data.id}" movie-name="${data.original_title}">Supprimer des favoris</button>`
                            :`<button id="addFavorite" movie-id="${data.id}" movie-name="${data.original_title}">Ajouter en favori</button>`
                        }
                        <button id="closeButton">Fermer</button>
                    </div>
                </div>
            `;

        moviePopin.parentElement.classList.remove('close');
        moviePopin.parentElement.classList.add('open');
        closePopin(document.querySelector('#closeButton'))
        favList.includes(data.id.toString()) ? deleteToFav() : addToFav() ;
    };

    const addToFav = () => {
        let favBtn = document.querySelector('#addFavorite');
        favBtn.addEventListener('click', () => {
            if(localStorage.getItem("userId")){
                fetchData({
                    url: favURL,
                    method: "POST",
                    data: {
                        'author': localStorage.getItem("userId"),
                        'id': favBtn.getAttribute('movie-id'),
                        'title': favBtn.getAttribute('movie-name')
                    }
                })
                // Close popup after adding to favorite
                document.querySelector('#closeButton').parentElement.parentElement.parentElement.classList.remove('open');
                document.querySelector('#closeButton').parentElement.parentElement.parentElement.classList.add('close');
            }
        })
    }

    const deleteToFav = () => {
        let favBtn = document.querySelector('#deleteFavorite');
        favBtn.addEventListener('click', () => {
            if(localStorage.getItem("userId")){
                fetchData({
                    url: favURL+'/'+parseInt(favBtn.getAttribute('movie-id')),
                    method: "DELETE",
                })
                // Close popup after adding to favorite
                document.querySelector('#closeButton').parentElement.parentElement.parentElement.classList.remove('open');
                document.querySelector('#closeButton').parentElement.parentElement.parentElement.classList.add('close');
            }
        })
    }

    const closePopin = button => {
        button.addEventListener('click', () => {
            if(moviePopin.parentElement.classList.contains("close")) {
                moviePopin.parentElement.classList.remove('close');
                moviePopin.parentElement.classList.add('open');
            } else {
                moviePopin.parentElement.classList.remove('open');
                moviePopin.parentElement.classList.add('close');
            }
        })
    };

    const IHM = () => {
/*        let db = new PouchDB('chat_room');
        if(localStorage.getItem("userId")){
            db.put({
                _id: new Date().toISOString(),
                author: localStorage.getItem("userId"),
                pseudo: 'Allan',
                message: 'On est là',
            });

            db.changes().on('change', function() {
                console.log('Ch-Ch-Changes');
            });

            db.replicate.to('https://couch.dwsapp.io/chat_room/');
        }*/
        getUserInfos();
        initPopupForm();
        getSearchSumbit();
        validRegisterForm();
        validLoginForm();
    }

    /* 
    Lancer IHM
    */
    IHM();
    //
});