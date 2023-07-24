// константы для добавления кота
const $wrapper = document.querySelector("[data-wrapper]");
const $addButton = document.querySelector("[data-add_new_cat]");
const $modalWrapper = document.querySelector("[data-modal]");
const $closeModalButton = document.querySelector('.close-modal');
const $forma = document.querySelector('.forma');
const $formErrorMsg = document.querySelector('[data-ermsg]');
const $resetAddBtn = document.querySelector('.reset-modal');

//константы для Open 
const $modalWrapperOpen = document.querySelector("[data-modal-open]");
const $openModalPanel = document.querySelector('.modal_open_panel');
const $closeOpenButton = document.querySelector('.close-modal-o');

//константы для Edit
const $modalWrapperEdit = document.querySelector("[data-modal-edit]");
const $editModalPanel = document.querySelector('.modal_edit_panel');
const $closeEditButton = document.querySelector('.close-modal-e');

//загружаем всех котов на страницу
const generateCatCard = (cat) =>{
    return (
        `<div data-card_id=${cat.id} class="card mb-2" style="width: 16,5rem">
          <img
            src="${cat.image}"
            class="card-img-top"
            alt="${cat.name} photo"
          />
          <div class="card-body">
            <h5 class="card-title">${cat.name}</h5>
            <p class="card-text">${cat.description}</p>
            <button type="button" data-action ="open" class="btn btn-outline-dark">Open</button>
            <button type="button" data-action ="edit" class="btn btn-outline-dark"><i class="fa-solid fa-pencil"></i> Edit</button>
            <button type="button" data-action ="delete" class="btn btn-outline-dark"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
        </div>`
      
    )
   
}

const firstGettingCats = async ()=> {
    const res = await api.getAllCats();

    if(res.status !== 200){
      const $errorMessage = document.createElement('p');
      $errorMessage.innerText = "Error, try again";
      $errorMessage.classList.add('error-msg');

      return $wrapper.appendChild($errorMessage);
     }

    const data  = await res.json();

    if(data.length === 0) {
      const $notificationMessage = document.createElement('p');
      $notificationMessage.innerText = "There is no cats yet, add the first one!"
      return $wrapper.appendChild($notificationMessage);
     }

    data.forEach(cat => {
        $wrapper.insertAdjacentHTML('afterbegin', generateCatCard(cat))
      });
}

firstGettingCats();


//форма добавления кота
$addButton.addEventListener('click',async (event)=>{
  $modalWrapper.classList.remove("hidden_create");
  document.body.style.overflow = 'hidden';
  $formErrorMsg.innerHTML='';
  if(parseData) {
    Object.keys(parseData).forEach(key =>{
      document.forms.add_cats_form[key].value = parseData[key];
   
    })
  }
})

document.forms.add_cats_form.addEventListener('submit', async (event) => {
  event.preventDefault();
  $formErrorMsg.innerHTML='';
  localStorage.clear(); 
  document.body.style.overflow = 'scroll';

  const data = Object.fromEntries(new FormData(event.target).entries());

  data.id = Number(data.id)
  data.age = Number(data.age)
  data.rate = Number(data.rated)
  if(document.querySelector('.addfav').checked){
    data.favorite = 'true';
  }
  else {
    data.favorite = 'false';
  }
  const res = await api.addNewCat(data);
  

  if(res.ok){
    $wrapper.replaceChildren();
    firstGettingCats();
    $modalWrapper.classList.add("hidden_create");
    return $forma.reset(); 
  } else{
    const responce = await res.json();
    $formErrorMsg.innerText = responce.message;
    return;
  }
  
})

$closeModalButton.addEventListener('click', (event)=>{
  $modalWrapper.classList.add("hidden_create");
  localStorage.clear();
  $forma.reset();
  document.body.style.overflow = 'scroll';
})

$resetAddBtn.addEventListener('click', (event)=>{
  localStorage.clear();
  $forma.reset();
})

//сохранение формы добавления в LS
const formDataFromLC = localStorage.getItem(document.forms.add_cats_form.name);
const parseData = formDataFromLC? JSON.parse(formDataFromLC): null;

document.forms.add_cats_form.addEventListener('input', event =>{
  const formData = Object.fromEntries(new FormData(document.forms.add_cats_form).entries());
  localStorage.setItem(document.forms.add_cats_form.name, JSON.stringify(formData));
})

//функции открытия, удаления, редактирования
$wrapper.addEventListener('click',async (event)=>{
  const action = event.target.dataset.action;
  
  switch (action) {
    case 'delete':
      const $currentCard = event.target.closest('[data-card_id]');
      const catId = $currentCard.dataset.card_id;
      try{
        const res = await api.deleteCat(catId);
        const responce = await res.json();
      if(!res.ok) throw Error (responce.message)
      $currentCard.remove();
      } catch (error){
          console.log(error);
      }
      break;

    case 'open':
      const $openCard = event.target.closest('[data-card_id]');
      const catOpenId = $openCard.dataset.card_id;

      try{
        const infoAboutCard = await api.getCurrentCat(catOpenId);
        const responceOpen = await infoAboutCard.json();
      if(!infoAboutCard.ok) throw Error (responceOpen.message)
      $modalWrapperOpen.classList.remove("hidden_open");
      document.body.style.overflow = 'hidden';
      
      let catImage = document.querySelector('.cat_image')
      catImage.innerHTML = `<img
      src= ${responceOpen.image}
      class="card-img-close"
      alt="oops, no cat photo("
      />`
      document.querySelector('[data-open-tittle]').innerText = `${responceOpen.name}`;
      document.querySelector('[data-open-id]').innerText = `ID: ${responceOpen.id}`;
      document.querySelector('[data-open-age]').innerText = `Age: ${responceOpen.age}`;
      document.querySelector('[data-open-rate]').innerText = `Rate: ${responceOpen.rate}`;
      document.querySelector('[data-open-description]').innerText = `Description: ${responceOpen.description}`;
      if(responceOpen.favorite){
        document.querySelector('.openFav').style.background = 'url(img/checkbox_checked.png)';
        document.querySelector('.fcxO').style.background = 'url(img/checkbox_checked.png)';
      }
      else{
       document.querySelector('.openFav').style.background = 'url(img/checkbox_empty.png)';
        document.querySelector('.fcxO').style.background = 'url(img/checkbox_empty.png)';
      }

      } catch (error){
      console.log(error);
      }
      break;
    
    case 'edit':
      const $editCard = event.target.closest('[data-card_id]');
      const catEditId = $editCard.dataset.card_id;
      try{
        const editInfo = await api.getCurrentCat(catEditId);
        const responceEdit = await editInfo.json();
      if(!editInfo.ok) throw Error (responceEdit.message);
      $modalWrapperEdit.classList.remove('hidden_edit');
      document.body.style.overflow = 'hidden';
      
      document.forms.edit.image.value = responceEdit.image;
      document.forms.edit.name.value = responceEdit.name;
      document.forms.edit.id.value= Number(responceEdit.id);
      document.forms.edit.age.value = Number(responceEdit.age);
      document.forms.edit.rate.value = Number(responceEdit.rate);
      document.forms.edit.description.value = responceEdit.description;
      if(responceEdit.favorite){
       document.querySelector('.select').innerHTML ='<select class="form-select efv" id ="select" aria-label="Default select example"> <option selected value ="1">Favorite</option>  <option value ="2">Not favorite</option> </select> '
      }
      else{
        document.querySelector('.select').innerHTML = '<select class="form-select efv"id ="select" aria-label="Default select example"> <option selected value ="2">Not favorite</option>  <option value ="1">Favorite</option> </select> '
      }
     
      } catch(error){
        console.log(error)
      }
        break;
        default:
        break;
  }
})

//кнопки для закрытия и сабмита для модалок
$closeOpenButton.addEventListener('click', (event)=>{
  $modalWrapperOpen.classList.add("hidden_open");
  document.body.style.overflow = 'scroll';
  
})


document.forms.edit.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  
  data.id = Number(data.id);
  data.age = Number(data.age);
  data.rate = Number(data.rate);
  data.favorite = data.favorite == 'on';
  if(select.value =='1'){
    data.favorite = 'true';
  }
  else {
    data.favorite = 'false';
  }

  let editId = data.id;
  const res = await api.editCat(editId, data);
  
  document.forms.edit.image.value = data.image;
  document.forms.edit.name.value = data.name;
  document.forms.edit.age.value = data.age;
  document.forms.edit.rate.value = data.rate;
  document.forms.edit.description.value = data.description;
  if(select.value =='1'){
   document.querySelector('.select').innerHTML ='<select class="form-select efv" id ="select" aria-label="Default select example"> <option selected value ="1">Favorite</option>  <option value ="2">Not favorite</option> </select> '
   data.favorite = 'true';
   select.value="1"
  }
  else{
    document.querySelector('.select').innerHTML = '<select class="form-select efv" id ="select" aria-label="Default select example"> <option selected value ="2">Not favorite</option>  <option value ="1">Favorite</option> </select> '
    data.favorite = 'false';
    select.value="2"
  }
  $wrapper.replaceChildren();
  firstGettingCats();
  
  $modalWrapperEdit.classList.add("hidden_edit");
  document.body.style.overflow = 'scroll';

})

$closeEditButton.addEventListener('click', (event)=>{
  $modalWrapperEdit.classList.add("hidden_edit");
  document.body.style.overflow = 'scroll';
})