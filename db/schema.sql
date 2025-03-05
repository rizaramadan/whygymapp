--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: whygym; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA whygym;


ALTER SCHEMA whygym OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL
);


ALTER TABLE public.schema_migrations OWNER TO postgres;

--
-- Name: members; Type: TABLE; Schema: whygym; Owner: postgres
--

CREATE TABLE whygym.members (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    nickname character varying(100) NOT NULL,
    date_of_birth date,
    phone_number character varying(20),
    membership_status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    notes text,
    additional_data json,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE whygym.members OWNER TO postgres;

--
-- Name: members_id_seq; Type: SEQUENCE; Schema: whygym; Owner: postgres
--

CREATE SEQUENCE whygym.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE whygym.members_id_seq OWNER TO postgres;

--
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: whygym; Owner: postgres
--

ALTER SEQUENCE whygym.members_id_seq OWNED BY whygym.members.id;


--
-- Name: roles; Type: TABLE; Schema: whygym; Owner: postgres
--

CREATE TABLE whygym.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE whygym.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: whygym; Owner: postgres
--

CREATE SEQUENCE whygym.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE whygym.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: whygym; Owner: postgres
--

ALTER SEQUENCE whygym.roles_id_seq OWNED BY whygym.roles.id;


--
-- Name: user_roles; Type: TABLE; Schema: whygym; Owner: postgres
--

CREATE TABLE whygym.user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE whygym.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: whygym; Owner: postgres
--

CREATE TABLE whygym.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE whygym.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: whygym; Owner: postgres
--

CREATE SEQUENCE whygym.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE whygym.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: whygym; Owner: postgres
--

ALTER SEQUENCE whygym.users_id_seq OWNED BY whygym.users.id;


--
-- Name: visits; Type: TABLE; Schema: whygym; Owner: postgres
--

CREATE TABLE whygym.visits (
    id bigint NOT NULL,
    member_id integer NOT NULL,
    check_in_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    check_in_date date DEFAULT CURRENT_DATE NOT NULL,
    email character varying(100) NOT NULL,
    pic_url character varying(255) NOT NULL,
    notes text,
    additional_data json
);


ALTER TABLE whygym.visits OWNER TO postgres;

--
-- Name: visits_id_seq; Type: SEQUENCE; Schema: whygym; Owner: postgres
--

CREATE SEQUENCE whygym.visits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE whygym.visits_id_seq OWNER TO postgres;

--
-- Name: visits_id_seq; Type: SEQUENCE OWNED BY; Schema: whygym; Owner: postgres
--

ALTER SEQUENCE whygym.visits_id_seq OWNED BY whygym.visits.id;


--
-- Name: members id; Type: DEFAULT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.members ALTER COLUMN id SET DEFAULT nextval('whygym.members_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.roles ALTER COLUMN id SET DEFAULT nextval('whygym.roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.users ALTER COLUMN id SET DEFAULT nextval('whygym.users_id_seq'::regclass);


--
-- Name: visits id; Type: DEFAULT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.visits ALTER COLUMN id SET DEFAULT nextval('whygym.visits_id_seq'::regclass);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);


--
-- Name: idx_members_membership_status; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_members_membership_status ON whygym.members USING btree (membership_status);


--
-- Name: idx_members_user_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_members_user_id ON whygym.members USING btree (email);


--
-- Name: idx_user_roles_role_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_user_roles_role_id ON whygym.user_roles USING btree (role_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_user_roles_user_id ON whygym.user_roles USING btree (user_id);


--
-- Name: idx_users_username; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_users_username ON whygym.users USING btree (username);


--
-- Name: idx_visits_check_in_date; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_visits_check_in_date ON whygym.visits USING btree (check_in_date);


--
-- Name: idx_visits_email; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_visits_email ON whygym.visits USING btree (email);


--
-- Name: idx_visits_member_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_visits_member_id ON whygym.visits USING btree (member_id);


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES whygym.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES whygym.users(id) ON DELETE CASCADE;


--
-- Name: visits visits_member_id_fkey; Type: FK CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.visits
    ADD CONSTRAINT visits_member_id_fkey FOREIGN KEY (member_id) REFERENCES whygym.members(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

