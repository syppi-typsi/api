import { query } from "./index";

export const execute = async () => {
	try {
		await query(usersTable, []);
		console.log('If does not exist, table "users" is created');
	} catch (error) {
		console.error(error);
	}

	try {
		await query(placesTable, []);
		console.log('If does not exist, table "places" is created');
	} catch (error) {
		console.error(error);
	}

	try {
		await query(categoryTable, []);
		console.log('If does not exist, table "category" is created');
	} catch (error) {
		console.error(error);
	}

	try {
		await query(drinkTable, []);
		console.log('If does not exist, table "drink" is created');
	} catch (error) {
		console.error(error);
	}

	try {
		await query(ratingsTable, []);
		console.log('If does not exist, table "ratings" is created');
	} catch (error) {
		console.error(error);
	}

	try {
		await query(alterTables, []);
		console.log("If not already, tables are altered");
	} catch (error) {
		console.error(error);
	}
};

const usersTable = `CREATE TABLE IF NOT EXISTS "users" (
    "id" serial NOT NULL,
    "username" varchar(255) NOT NULL,
    "first_name" varchar(255),
    "last_name" varchar(255),
    "email" varchar(255) NOT NULL,
    "registered_on" TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY("id")
    );`;

const placesTable = `CREATE TABLE IF NOT EXISTS "places" (
    "id" serial NOT NULL,
    "name" varchar(255) NOT NULL,
    "address" varchar(255) NOT NULL,
    PRIMARY KEY("id")
    );`;

const categoryTable = `CREATE TABLE IF NOT EXISTS "category" (
    "id" serial NOT NULL,
    "name" varchar(255) NOT NULL,
    "parent" int,
    PRIMARY KEY("id")
    );`;

const drinkTable = `CREATE TABLE IF NOT EXISTS "drink" (
    "id" serial NOT NULL,
    "name" varchar(255) NOT NULL,
    "producer" varchar(255) NOT NULL,
    "brand" varchar(255),
    "description" text,
    "product_image" varchar(255),
    "category" int NOT NULL,
    "added_on" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "volumes" integer[],
    "abv" float,
    "places" integer[],
    "nutritional_value" json,
    "search" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple',name),'A') || ' ' || 
        setweight(to_tsvector('simple',coalesce(producer, '')),'B') || ' ' || 
        setweight(to_tsvector('simple',coalesce(description, '')),'C') :: tsvector
        ) STORED,
    PRIMARY KEY("id")
    );`;

const ratingsTable = `CREATE TABLE IF NOT EXISTS "ratings" (
    "id" serial NOT NULL,
    "user" int NOT NULL,
    "drink" int NOT NULL,
    "rating" int,
    PRIMARY KEY("id")
    );`;

const alterTables = `
    DO $$
    BEGIN

    BEGIN
        ALTER TABLE "drink" 
        ADD CONSTRAINT "drink_place"
        FOREIGN KEY("places") REFERENCES "places"("id")
        ON UPDATE CASCADE ON DELETE CASCADE;
    EXCEPTION
        WHEN duplicate_table THEN
        WHEN duplicate_object THEN
        RAISE NOTICE 'Table constraint drink_place already exists';
    END;

    BEGIN
        ALTER TABLE "drink"
        ADD CONSTRAINT "drink_category"
        FOREIGN KEY("category") REFERENCES "category"("id");
    EXCEPTION
        WHEN duplicate_table THEN
        WHEN duplicate_object THEN
        RAISE NOTICE 'Table constraint drink_category already exists';
    END;

    ALTER TABLE drink ADD COLUMN IF NOT EXISTS "search" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple',name),'A') || ' ' || 
        setweight(to_tsvector('simple',coalesce(producer, '')),'B') || ' ' || 
        setweight(to_tsvector('simple',coalesce(description, '')),'C') :: tsvector
        ) STORED;

    CREATE INDEX IF NOT EXISTS search_idx ON "drink" USING gin(search);

    BEGIN
        ALTER TABLE "category"
        ADD CONSTRAINT "category_parent"
        FOREIGN KEY("parent") REFERENCES "category"("id")
        ON UPDATE CASCADE ON DELETE CASCADE;
    EXCEPTION
        WHEN duplicate_table THEN
        WHEN duplicate_object THEN
        RAISE NOTICE 'Table constraint category_parent already exists';
    END;

    BEGIN
        ALTER TABLE "ratings"
        ADD CONSTRAINT "rating_drink"
        FOREIGN KEY("drink") REFERENCES "drink"("id")
        ON UPDATE CASCADE ON DELETE CASCADE;
    EXCEPTION
        WHEN duplicate_table THEN
        WHEN duplicate_object THEN
        RAISE NOTICE 'Table constraint rating_drink already exists';
    END;

    BEGIN
        ALTER TABLE "ratings"
        ADD CONSTRAINT "rating_user"
        FOREIGN KEY("user") REFERENCES "users"("id")
        ON UPDATE CASCADE ON DELETE CASCADE;
    EXCEPTION
        WHEN duplicate_table THEN
        WHEN duplicate_object THEN
        RAISE NOTICE 'Table constraint rating_user already exists';
    END;

    END $$;`;
