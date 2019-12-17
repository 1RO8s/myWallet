console.log("index.js");
let contract;
let userAccount;
// let tasks = [];
// let tgt;
let keyObj; // keystoreファイルの読込結果
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/2c2ba27487724756809fe0b37517a457"));
//const web3 = new Web3(web3.currentProvider);

async function startApp() {
  await web3.eth.getAccounts((error, accounts) => {
    if (accounts[0] !== userAccount) {
      userAccount = accounts[0];
    }
    console.log('error:');
    console.log(error);
  });
  let accountInterval = setInterval(function(){
    web3.eth.getAccounts(async(error, accounts) => {
      if(accounts[0] !== userAccount){
        userAccount = accounts[0];
      }
    })
  },100);
}



/***************************************************
* 共通
***************************************************/

window.addEventListener('load', () => {
  console.log("onload");
  if (typeof web3 !== 'undefined') {
      //web3 = new Web3(web3.currentProvider);
      //web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/2c2ba27487724756809fe0b37517a457'))
      console.log("web3:");
      console.log(web3)
  } else {
      console.log('metamask not found');
  }
  setNavbarEvent();
  //startApp();
  web3.eth.getGasPrice().then((gasPrice) => {
    document.getElementById('gasPrice').value = gasPrice;
  }).catch(console.log)


})

//
function setNavbarEvent(){
  // console.log("setavbarEvet")
  let navItems = document.getElementsByClassName("nav-item"); // li要素
  let sections = document.getElementsByTagName("section");
  // console.log(sections);
  let walletInfoNav = navItems[0];
  let crtAccountNav = navItems[1];

  // セクションの初期表示

  showSections([
    'importAccount',
    'viewWalletInfo',
    'sendETH'
  ]);
  //showSection('sendETH')

  walletInfoNav.addEventListener("click",function(){
    // navbarのスタイル切り替え
    for(let nav of navItems){
      nav.classList.remove("active");
      if(nav === walletInfoNav){
        nav.classList.add("active");
      }
    }
    //showSection('importAccount');
    showSections([
      'importAccount',
      'viewWalletInfo',
      'sendETH'
    ]);
  },false);

  crtAccountNav.addEventListener("click",function(){
    // navbarのスタイル切り替え
    for(let nav of navItems){
      nav.classList.remove("active");
      if(nav === crtAccountNav){
        nav.classList.add("active");
      }
    }
    showSection('createAccount');
  },false);

}

function showSections(_sectionIds){
  console.log('showSection:'+_sectionIds);
  let sections = document.getElementsByTagName("section");
  for(let sec of sections){
    sec.style.display = "none";
    if(_sectionIds.includes(sec.id)){
      sec.style.display = "block";
    }
  }
}

function showSection(_sectionId){
  console.log('showSection:'+_sectionId);
  let sections = document.getElementsByTagName("section");
  for(let sec of sections){
    sec.style.display = "none";
    if(_sectionId == sec.id){
      sec.style.display = "block";
    }
  }
}


function formReset(){
  keyObj = undefined;
}

/***************************************************
* Create account
***************************************************/

document.getElementById('createNewAccount').addEventListener('click',
function(){
  let password = document.getElementById('enterPassword');
  if(password.value == ''){
    alert('Enter a password.');
  }else{
    // アカウント作成
    let account = web3.eth.accounts.create();
    console.log(`"${account.privateKey}"`);
    console.log(`"${password.value}"`);
    // アカウントのキー、パスワードを暗号化
    let keystore = web3.eth.accounts.encrypt(account.privateKey, password.value);
    console.log(keystore);

    let blob = new Blob([JSON.stringify(keystore)], {type:"application/json"});
    console.log(blob);
    let url = URL.createObjectURL(blob);
    console.log(url);
    let link = document.getElementById('download');
    link.href = url;
    console.log(account);
    let area = document.getElementById('yourPrivateKey_textarea');
    //let area = document.querySelector('textarea[id=yourPrivateKey"]');
    area.value = account.privateKey;
    console.log(area);

    document.getElementById('saveYourAddress').addEventListener('click',function(){
      console.log('saveYourAddress!!')
      importAccount(account);
    },false);

    // 次のセクションを表示
    showSection('saveYourKeystoreFile');
  }
},false);


// download後にcontinueボタンを有効化
document.getElementById("download").addEventListener("click",function(){
  let continueBtn = document.getElementById("continue");
  continueBtn.disabled = false;
},false);

document.getElementById("continue").addEventListener("click",function(e){
  showSection('saveYourPrivateKey');
},false);


/***************************************************
* View wallet info
***************************************************/

// 秘密鍵からアカウント情報を取得する処理
document.getElementById('unlockWithKey').addEventListener('click',function(){
  let privateKey = document.getElementById('inputKey').value;
  if(!privateKey.match(/^[0-9A-Fa-f]{64}$/)){
    alert('Enter the private key.');
  }else{
    let account = web3.eth.accounts.privateKeyToAccount('0x'+privateKey);
    importAccount(account);
    showSection('viewWalletInfo');
  }
},false);

 // keystoreからアカウント情報を取得する処理
 document.getElementById('inputKeystore').addEventListener('change',function(e){
   const file = e.target.files[0];
   console.log(file);
   e.target.nextElementSibling.textContent = file.name;
   const reader = new FileReader();
   reader.addEventListener('load',function(){
     try{
       //console.log(reader.result);
       keyObj = JSON.parse(reader.result);
     }catch(e){
       alert('keystoreを選択してください。');
     }
   },false);
   reader.readAsText(file);
 },false)

//
document.getElementById('unlockWithKeystore').addEventListener('click',async function(){
  let password = document.getElementById('enterYourPassword').value;
  console.log(`password:${password}`)
  if(password == ""){
    alert('Enter the password');
  }else{
    const account = web3.eth.accounts.decrypt(keyObj, password);
    console.log('account:');
    console.log(account);
    await importAccount(account);
    showSection('viewWalletInfo');
  }
},false);

async function importAccount(account){
  console.log('call importAccount')
  console.log(account);
  document.querySelector('#yourAddress td').textContent = account.address;
  document.querySelector('#yourPrivateKey td').textContent = account.privateKey;
  await web3.eth.getBalance(account.address).then((balance)=>{
    console.log('get balance')
    document.querySelector('#yourBalace td').textContent = web3.utils.fromWei(balance, 'ether');
    let unit = document.createElement('strong');
    unit.textContent = 'ETH'
    console.log('unit:')
    console.log(unit);
    document.querySelector('#yourBalace td').appendChild(unit);
  });
}

/***************************************************
* Send Ether & Token
***************************************************/


document.getElementById('generateTransaction').addEventListener('click',async function(){
  //let addressFrom = userAccount;
  let addressFrom = '0xF8a3F1554337c81Ee898e0F30a0B43CB950f363F';
  let addressTo = document.getElementById('toAddress').value;
  let gasPrice = document.getElementById('gasPrice').value;
  let gasLimit = document.getElementById('gasLimit').value;
  let value = document.getElementById('amountToSend').value;
  let privateKey = '0xd435286553269a754bc0c1445493b120502949f5293fd1cafe2bcd9801ebf29b'
  console.log(`
    addressFrom:${addressFrom}
    addressTo:${addressTo}
    gasPrice:${gasPrice}
    gasLimit:${gasLimit}
    value:${value}
    privateKey:${privateKey}
  `)

  let nonce = await web3.eth.getTransactionCount(addressFrom);
  console.log(`nonce:${nonce}`)

  let rawTransaction = {
    nonce: web3.utils.toHex(nonce),
    gasPrice: web3.utils.toHex(gasPrice),
    gasLimit: web3.utils.toHex(gasLimit),
    to: addressTo,
    value: web3.utils.toHex(web3.utils.toWei(value, 'ether')),
    data:'0x'
  }
  console.log('rawTransaction:');
  console.log(rawTransaction);

  let transaction = new ethereumjs.Tx(rawTransaction);
  console.log('transaction:');
  console.log(transaction);

  privateKey = new ethereumjs.Buffer.Buffer(privateKey.substr(2),'hex');
  console.log('privateKey:');
  console.log(privateKey)

  transaction.sign(privateKey);
  let serializedTx = transaction.serialize();
  let signedTransaction = '0x' + serializedTx.toString('hex')
  console.log('signedTransaction:');
  console.log(signedTransaction);

  document.getElementById('rawTransaction').textContent = JSON.stringify(rawTransaction);
  document.getElementById('signedTransaction').textContent = signedTransaction;

},false)


document.getElementById('sendTransaction').addEventListener('click',function(){
  let signedTransaction = document.getElementById('signedTransaction').textContent;
  web3.eth.sendSignedTransaction(signedTransaction)
    .on('transactionHash',function(hash){
      console.log('hash:');
      console.log(hash);
    }).on('receipt',async function(receipt){
      console.log('receipt');
      console.log(receipt);
      let privateKey = '0xd435286553269a754bc0c1445493b120502949f5293fd1cafe2bcd9801ebf29b';
      let account = web3.eth.accounts.privateKeyToAccount(privateKey);
      console.log('account:');
      console.log(account);
      await importAccount(account);

      $('#sendTxModal').modal('hide');
    }).on('error',function(error){
      alert(error);
    })
},false)


function showGasPrice(){
  web3.eth.getGasPrice().then((gasPrice) => {
    //document.getElementById('gasPrice').value = gasPrice;
    console.log('gasPrice:');
    console.log(gasPrice);
  }).catch(console.log)
}

/*

async function getTask(){
  tasks = [];
  await contract.methods.getTaskId(userAccount).call().then(async (value)=>{
    for(let i = 0;i < value.length;i++){
      await contract.methods.tasks(value[i]).call().then((task)=>{
        tasks.push({
          id:value[i],
          name:task.name,
          completed:task.completed
        })
      },false)
    }
  },false);
}


function showTask(){
  const taskList = document.getElementById("taskList");
  while(taskList.firstChild){
    taskList.removeChild(taskList.firstChild);
  }
  for(let i=0;i < tasks.length ; i++){
    const list = document.createElement("li");
    list.textContent = tasks[i].name;
    if(tasks[i].completed){
      list.classList.add('done');
    }
    list.addEventListener('click',function(e){
      let taskId = tasks[i].id;
      isComplete(taskId);
    },false)
    taskList.appendChild(list);
  }
}

async function isComplete(taskId){
  await contract.methods.completeTask(taskId).send({from: userAccount})
  .on("transactionHash", (txhash) => {
      alert("Txhash: " +  txhash);
  }).on("receipt", (receipt) => {
      console.log(receipt)
  }).on("error", (error) => {
      console.log(error)
  });
  await getTask();
  showTask();
}

async function saveTask() {
  const taskName = document.getElementById("task_name");
  const lists = document.getElementById("taskList");
  const li = document.createElement("li");
  if(taskName.value == ""){
    window.alert("Aiを入力してください。");
  }else{
    await contract.methods.saveTask(taskName.value).send({ from: userAccount })
    .on("transactionHash", (txhash) => {
      alert("Txhash: " +  txhash);
    }).on("receipt", (receipt) => {
      console.log(receipt)
    }).on("error", (error) => {
      console.log(error)
    });
    await getTask();
    showTask();
    taskName.value = "";
  }
}

function get() {
  contract.methods.get().call().then((value) => {
      alert(value);
  });
}


function test(){
  const promise = new Promise(function(resolve){
    //resolve();
    console.log(1);
    setTimeout(resolve,1000);
    console.log(2);
  });
  promise.then(function(){
    console.log(3);
  });
  return "end";
}

function test(){
  const promise = new Promise(resolve=>{
    //console.log(1);
    setTimeout(()=>console.log(5),10);
    //console.log(2);
    //resolve();
    //console.log(3);
    setTimeout(resolve,0);
    //console.log(4);
    setTimeout(()=>console.log(8),10);
  });
  promise.then(function(){
    console.log(6);
    setTimeout(()=>console.log(9),8);
    console.log(7);
  });
  return "end";
}


function timestamp(){
  let cnt = 0;
  setInterval(()=>{
    console.log(`cont:${cnt}`);
    cnt++;
  },1000)
}
*/
