/* 
Attendre le chargement du DOM
*/
document.addEventListener('DOMContentLoaded', () => {

    /* 
    Déclarations
    */
    const searchForm = document.querySelector('header #searchForm');
    const searchLabel = document.querySelector('header #searchForm span');
    const searchData = document.querySelector('[name="searchData"]');
    const themoviedbUrl = 'https://api.themoviedb.org/3/search/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&query=';
    const movieList = document.querySelector('#movieList');
    const moviePopin = document.querySelector('#moviePopin article');
    const formPopup = document.querySelector('#formPopup');
    const btnFormPupup = document.querySelector('#btnFormPupup');
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
    //

    /*
    Favorite
     */
    const favURL = 'https://api.dwsapp.io/api/favorite';

    /*
    User
     */
    const userURL = 'https://api.dwsapp.io/api/me';

    /* 
    Fonctions
    */
    const getUserInfos = () => {
        if(localStorage.getItem("userId")) {
            fetch(userURL+'/'+localStorage.getItem("userId"), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(response => {
                    return response.json()
                })
                .then(jsonData => {
                    console.log(jsonData);
                })
                .catch(err => console.error(err));
        } else {
            formPopup.classList.add('open');
            closeFormPopup(document.querySelector('#closeFormPopup'))
        }
    }

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

    const displayError = (tag, msg) => {
        searchLabel.textContent = msg;
        tag.addEventListener('focus', () => searchLabel.textContent = '');
    };

    /*
    Fetch to socket server
     */
    const fetchData = (fetchConfig) => {
        fetch(fetchConfig.url, {
            method: fetchConfig.method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fetchConfig.data)
        })
            .then(response => {
                return response.json()
            })
            .then(jsonData => {
                console.log(jsonData);
                if(jsonData.data.identity) {
                    localStorage.setItem("userId",jsonData.data.identity._id)
                }
            })
            .catch(err => console.error(err));
    };

    const initPopupForm = () => {
        btnFormPupup.addEventListener('click', () => {
            formPopup.classList.add('open');
            closeFormPopup(document.querySelector('#closeFormPopup'))
        })
    }

    const closeFormPopup = button => {
        button.addEventListener('click', () => {
            button.parentElement.parentElement.parentElement.classList.add('close');
            setTimeout(() => {
                button.parentElement.parentElement.parentElement.classList.remove('open');
                button.parentElement.parentElement.parentElement.classList.remove('close');
            }, 300)
        })
    }


    /*
    Fetch to Themoviedb
     */
    const fetchFunction = (keywords, index = 1) => {

        let fetchUrl = null;

        typeof keywords === 'number'
            ? fetchUrl = `https://api.themoviedb.org/3/movie/${keywords}?api_key=6fd32a8aef5f85cabc50cbec6a47f92f`
            : fetchUrl = themoviedbUrl + keywords + '&page=' + index


        fetch(fetchUrl)
            .then(response => response.ok ? response.json() : 'Response not OK')
            .then(jsonData => {
                typeof keywords === 'number'
                    ? displayPopin(jsonData)
                    : displayMovieList(jsonData.results)
            })
            .catch(err => console.error(err));
    };

    const displayMovieList = collection => {
        searchData.value = '';
        movieList.innerHTML = '';

        console.log(collection)
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
        console.log(data);
        moviePopin.innerHTML = `
                <div>
                    <img src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="${data.original_title}">
                </div>

                <div>
                    <h2>${data.original_title}</h2>
                    <p>${data.overview}</p>
                    <button>Voir en streaming</button>
                    <button id="addFavorite" movie-id="${data.id}" movie-name="${data.original_title}">Ajouter en favori</button>
                    <button id="closeButton">Close</button>
                </div>
            `;

        moviePopin.parentElement.classList.add('open');
        closePopin(document.querySelector('#closeButton'))
        addToFav();
    };

    const addToFav = () => {
        let favBtn = document.querySelector('#addFavorite');
        favBtn.addEventListener('click', () => {
            fetchData({
                url: favURL,
                method: "POST",
                data: {
                    'author': localStorage.getItem("userId"),
                    'id': favBtn.getAttribute('movie-id'),
                    'name': favBtn.getAttribute('movie-name')
                }
            })
        })
    }

    const closePopin = button => {
        button.addEventListener('click', () => {
            button.parentElement.parentElement.parentElement.classList.add('close');
            setTimeout(() => {
                button.parentElement.parentElement.parentElement.classList.remove('open');
                button.parentElement.parentElement.parentElement.classList.remove('close');
            }, 300)
        })
    };

    /* 
    Lancer IHM
    */
    getUserInfos();
    initPopupForm();
    getSearchSumbit();
    validRegisterForm();
    validLoginForm();
    //
});