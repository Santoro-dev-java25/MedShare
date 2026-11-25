create table usuario (
	id bigserial ,
	nome varchar(100),
	email varchar(100),
	senha varchar(60),
	tipo varchar(30) check (tipo in ('FARMACIA','CLIENTE','ONG','ADMIN')),

	constraint pk_usu_id primary key(id)
);

create table farmacia(
	usuario_id bigint,
	cnpj varchar(20),
	endereco varchar(40),
	aprovado bool default false,

	constraint pk_frm_usuario_id primary key(usuario_id),
	constraint fk_frm_usuario_id foreign key(usuario_id) references usuario (id),
	constraint un_frm_cnpj unique(cnpj)
	
);

create table admin (
	usuario_id bigint,

	constraint pk_adm_usuario_id primary key(usuario_id),
	constraint fk_adm_usuario_id foreign key(usuario_id) references usuario (id)
);

create table cliente(
	usuario_id bigint,
	cpf varchar(11),
	endereco varchar(40),

	constraint pk_cln_usuario_id primary key(usuario_id),
	constraint fk_cln_usuario_id foreign key(usuario_id) references usuario(id),
	constraint un_cln_cpf unique(cpf)
);

create table ong(
	usuario_id bigint,
	cnpj varchar(20),
	area_atuacao varchar(100),
	aprovado bool default false,

	constraint pk_ong_usuario_id primary key(usuario_id),
	constraint fk_ong_usuario_id foreign key(usuario_id) references usuario(id),
	constraint un_ong_cnpj unique(cnpj)
);

















