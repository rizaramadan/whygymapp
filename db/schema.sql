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

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


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
-- Name: create_user_requests; Type: TABLE; Schema: whygym; Owner: postgres
--

CREATE TABLE whygym.create_user_requests (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(100),
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    approved_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE whygym.create_user_requests OWNER TO postgres;

--
-- Name: create_user_requests_id_seq; Type: SEQUENCE; Schema: whygym; Owner: postgres
--

CREATE SEQUENCE whygym.create_user_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE whygym.create_user_requests_id_seq OWNER TO postgres;

--
-- Name: create_user_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: whygym; Owner: postgres
--

ALTER SEQUENCE whygym.create_user_requests_id_seq OWNED BY whygym.create_user_requests.id;


--
-- Name: members; Type: TABLE; Schema: whygym; Owner: postgres
--

CREATE TABLE whygym.members (
    id integer NOT NULL,
    email character varying(100),
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
-- Name: order_groups; Type: TABLE; Schema: whygym; Owner: postgres
--

CREATE TABLE whygym.order_groups (
    id integer NOT NULL,
    main_reference_id character varying(40) NOT NULL,
    part_id integer NOT NULL,
    part_reference_id character varying(40) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    additional_info jsonb,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE whygym.order_groups OWNER TO postgres;

--
-- Name: order_groups_id_seq; Type: SEQUENCE; Schema: whygym; Owner: postgres
--

CREATE SEQUENCE whygym.order_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE whygym.order_groups_id_seq OWNER TO postgres;

--
-- Name: order_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: whygym; Owner: postgres
--

ALTER SEQUENCE whygym.order_groups_id_seq OWNED BY whygym.order_groups.id;


--
-- Name: orders; Type: TABLE; Schema: whygym; Owner: postgres
--

CREATE TABLE whygym.orders (
    id integer NOT NULL,
    price numeric(10,0) NOT NULL,
    reference_id character varying(40) DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    member_id integer,
    payment_method character varying(32) DEFAULT ''::character varying NOT NULL,
    url character varying(255) DEFAULT ''::character varying NOT NULL,
    order_status character varying(32) DEFAULT ''::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    additional_info jsonb
);


ALTER TABLE whygym.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: whygym; Owner: postgres
--

CREATE SEQUENCE whygym.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE whygym.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: whygym; Owner: postgres
--

ALTER SEQUENCE whygym.orders_id_seq OWNED BY whygym.orders.id;


--
-- Name: orders_status_log; Type: TABLE; Schema: whygym; Owner: postgres
--

CREATE TABLE whygym.orders_status_log (
    id integer NOT NULL,
    reference_id character varying(40) NOT NULL,
    order_status character varying(40) DEFAULT 'failed'::character varying NOT NULL,
    notes text,
    additional_info jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE whygym.orders_status_log OWNER TO postgres;

--
-- Name: orders_status_log_id_seq; Type: SEQUENCE; Schema: whygym; Owner: postgres
--

CREATE SEQUENCE whygym.orders_status_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE whygym.orders_status_log_id_seq OWNER TO postgres;

--
-- Name: orders_status_log_id_seq; Type: SEQUENCE OWNED BY; Schema: whygym; Owner: postgres
--

ALTER SEQUENCE whygym.orders_status_log_id_seq OWNED BY whygym.orders_status_log.id;


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
    email character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE whygym.users OWNER TO postgres;

--
-- Name: users_attributes; Type: TABLE; Schema: whygym; Owner: postgres
--

CREATE TABLE whygym.users_attributes (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    key character varying(255) NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE whygym.users_attributes OWNER TO postgres;

--
-- Name: users_attributes_id_seq; Type: SEQUENCE; Schema: whygym; Owner: postgres
--

CREATE SEQUENCE whygym.users_attributes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE whygym.users_attributes_id_seq OWNER TO postgres;

--
-- Name: users_attributes_id_seq; Type: SEQUENCE OWNED BY; Schema: whygym; Owner: postgres
--

ALTER SEQUENCE whygym.users_attributes_id_seq OWNED BY whygym.users_attributes.id;


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
    email character varying(100),
    pic_url character varying(255) NOT NULL,
    notes text,
    additional_data json,
    visit_code integer DEFAULT (floor((random() * (((99 - 10) + 1))::double precision)) + (10)::double precision) NOT NULL
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
-- Name: create_user_requests id; Type: DEFAULT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.create_user_requests ALTER COLUMN id SET DEFAULT nextval('whygym.create_user_requests_id_seq'::regclass);


--
-- Name: members id; Type: DEFAULT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.members ALTER COLUMN id SET DEFAULT nextval('whygym.members_id_seq'::regclass);


--
-- Name: order_groups id; Type: DEFAULT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.order_groups ALTER COLUMN id SET DEFAULT nextval('whygym.order_groups_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.orders ALTER COLUMN id SET DEFAULT nextval('whygym.orders_id_seq'::regclass);


--
-- Name: orders_status_log id; Type: DEFAULT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.orders_status_log ALTER COLUMN id SET DEFAULT nextval('whygym.orders_status_log_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.roles ALTER COLUMN id SET DEFAULT nextval('whygym.roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.users ALTER COLUMN id SET DEFAULT nextval('whygym.users_id_seq'::regclass);


--
-- Name: users_attributes id; Type: DEFAULT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.users_attributes ALTER COLUMN id SET DEFAULT nextval('whygym.users_attributes_id_seq'::regclass);


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
-- Name: create_user_requests create_user_requests_pkey; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.create_user_requests
    ADD CONSTRAINT create_user_requests_pkey PRIMARY KEY (id);


--
-- Name: create_user_requests create_user_requests_username_key; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.create_user_requests
    ADD CONSTRAINT create_user_requests_username_key UNIQUE (username);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: order_groups order_groups_pkey; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.order_groups
    ADD CONSTRAINT order_groups_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: orders_status_log orders_status_log_pkey; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.orders_status_log
    ADD CONSTRAINT orders_status_log_pkey PRIMARY KEY (id);


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
-- Name: users_attributes users_attributes_pkey; Type: CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.users_attributes
    ADD CONSTRAINT users_attributes_pkey PRIMARY KEY (id);


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
-- Name: idx_members_email_pic; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_members_email_pic ON whygym.members USING btree (((additional_data ->> 'emailPic'::text)));


--
-- Name: idx_members_membership_status; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_members_membership_status ON whygym.members USING btree (membership_status);


--
-- Name: idx_members_pending_email; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_members_pending_email ON whygym.members USING btree (email) WHERE ((membership_status)::text = 'pending'::text);


--
-- Name: idx_members_user_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_members_user_id ON whygym.members USING btree (email);


--
-- Name: idx_order_groups_main_reference_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_order_groups_main_reference_id ON whygym.order_groups USING btree (main_reference_id);


--
-- Name: idx_order_groups_part_reference_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_order_groups_part_reference_id ON whygym.order_groups USING btree (part_reference_id);


--
-- Name: idx_orders_member_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_orders_member_id ON whygym.orders USING btree (member_id);


--
-- Name: idx_orders_order_status; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_orders_order_status ON whygym.orders USING btree (order_status);


--
-- Name: idx_orders_reference_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE UNIQUE INDEX idx_orders_reference_id ON whygym.orders USING btree (reference_id);


--
-- Name: idx_orders_status_log_reference_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_orders_status_log_reference_id ON whygym.orders_status_log USING btree (reference_id);


--
-- Name: idx_user_roles_role_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_user_roles_role_id ON whygym.user_roles USING btree (role_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_user_roles_user_id ON whygym.user_roles USING btree (user_id);


--
-- Name: idx_users_attributes_key; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_users_attributes_key ON whygym.users_attributes USING btree (key);


--
-- Name: idx_users_attributes_user_id; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_users_attributes_user_id ON whygym.users_attributes USING btree (user_id);


--
-- Name: idx_users_attributes_user_id_key; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE INDEX idx_users_attributes_user_id_key ON whygym.users_attributes USING btree (user_id, key);


--
-- Name: idx_users_attributes_user_id_key_unique; Type: INDEX; Schema: whygym; Owner: postgres
--

CREATE UNIQUE INDEX idx_users_attributes_user_id_key_unique ON whygym.users_attributes USING btree (user_id, key);


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
-- Name: create_user_requests create_user_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.create_user_requests
    ADD CONSTRAINT create_user_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES whygym.users(id);


--
-- Name: orders orders_member_id_fkey; Type: FK CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.orders
    ADD CONSTRAINT orders_member_id_fkey FOREIGN KEY (member_id) REFERENCES whygym.members(id) ON DELETE CASCADE;


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
-- Name: users_attributes users_attributes_user_id_fkey; Type: FK CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.users_attributes
    ADD CONSTRAINT users_attributes_user_id_fkey FOREIGN KEY (user_id) REFERENCES whygym.users(id) ON DELETE CASCADE;


--
-- Name: visits visits_member_id_fkey; Type: FK CONSTRAINT; Schema: whygym; Owner: postgres
--

ALTER TABLE ONLY whygym.visits
    ADD CONSTRAINT visits_member_id_fkey FOREIGN KEY (member_id) REFERENCES whygym.members(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

