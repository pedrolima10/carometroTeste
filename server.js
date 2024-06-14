const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if(err){
        console.error(
            'Erro ao conectar com o bando de dados', err)
            return;
    }
    console.log('Conectando com banco de dados!');
});


app.post('/cadastro', async (req, res) => {
    const {nome, email, cpf, senha, celular, cep, logradouro, bairro, cidade, estado, imagem, Tipos_Usuarios_idTipos_Usuarios} = req.body;

    cep = cep.replace(/-/g,'');

    db.query(
        'SELECT cpf FROM usuarios WHERE cpf = ?',[cpf], async(err, results) =>{
            if(err){
                console.error('Erro ao consultar CPF:', err);

                return res.status(500).json({message: 'Erro ao verificar o CPF'})
            }

            if(results.length > 0){
                return res.status(400).json({message: ' CPF ja cadastrado.'});
            }

            const senhacripto = await bcrypt.hash(senha, 10);
            //primeiro argumneto é a variavel ser cripto
            //segundo argumneto é o custo do hash

            db.query('INSERT INTO usuarios (nome, email, cpf, senha, celular, cep, logradouro, bairro, cidade, estado, Tipos_Usuarios_idTipos_Usuarios, imagem) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
            [nome, email, cpf, senhacripto, celular, cep, logradouro, bairro, cidade, estado, Tipos_Usuarios_idTipos_Usuarios, imagem],
            (err, results) => {
                if(err){
                    console.error('Erro ao inserir usúario', err);
                    return res.status(500).json({message: 'Erro ao cadastrar usúario.'
                    })
                }

                console.log('Usuario inserido com sucesso:', results.idUsuarios);
                res.status(200).json({message: 'Usuarios cadastrado com sucesso!'})
            }
        }
    )
})

app.use(express.static('src'));
app.use(express.static(__dirname + '/src'));

//localhost:3000/login

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/src/login.html');
})

app.get('/cadastro', (req, res) => {
    res.sendFile(__dirname + '/src/cadastroUsuarios.html');
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));