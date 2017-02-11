var userProjects, selectedProject, selectedSource, selectedTarget

function isLoggedIn() {
  return request('/user')
    .then((status) => status.success)
}

function request(url, options) { //options is optional
  return fetch(url, Object.assign({}, options, { credentials: 'same-origin', headers: {'content-type': 'application/json'}})) //fetch is internal function
    .then(res => res.json())
    .catch(err => alert(err))
}

function getProjects() {
  return request('/api/projects').then(function(projects) { return userProjects = projects });
}

function hideLogin() {
  $('#login').hide()
  $('#container').show()
}

function showLogin() {
  $('#login').show().click(() => window.location.replace('/login')) // change url location of browser
  $('#container').hide()
}

function fetchProjects() {
  return getProjects().then(function(data) {
    $('.project .menu').empty(); //anything with a class of menu is a child of a class of project.
    for (var p of userProjects) {
      $('.project .menu').append('<div class="item" data-value="' + p.id + '">' + p.name + '</div>');
    }
    $('.project').dropdown('refresh')
    return data
  })
}

function fetchKeys() {
  return getKeys().then(function(data) {
    $('.keys .menu').empty();
    for (var k of data) {
      $('.keys .menu').append('<div class="item" data-value="' + k.label + '">' + k.label + '</div>');
    }
    $('.keys').dropdown('refresh')
    return data
  })
}

function getKeys() {
  return request('/api/keys?projectId=' + encodeURIComponent(selectedProject.id));
}

function init() {
  isLoggedIn()
    .then((status) => {
      if (status) {
        $('.ui.dropdown.project').dropdown({
          onChange: function(id) {
            selectedProject = userProjects.filter(function(p) { return p.id === id })[0]
            fetchKeys()
          }
        })
        $('.ui.dropdown.source-keys').dropdown({ //class of both ui and dropbown, using jquery ui
          onChange: function(id) {
            selectedSource = id
          }
        })
        $('.ui.dropdown.target-keys').dropdown({ //class of both ui and dropbown, using jquery ui
          onChange: function(id) {
            selectedTarget = id
          }
        })
        $('.ui.button.save').click(() => {
          let data = {
            source: selectedSource,
            dest: selectedTarget,
            project: selectedProject.id
          }
          let url = 'https://flux.io/p/' + selectedProject.id
          $('#success a').attr('href', url) //id of success and space means cchild 'a' element. a element is decendant of success. set the href to value of url
          request('/api/request', {body: JSON.stringify(data), method: 'POST'}) //send all data to url
          $('#container').fadeOut(200)
          setTimeout(() => { $('#success').fadeIn(200) }, 200)
        })
        fetchProjects()
      } else showLogin();
    })
}

window.onload = init
