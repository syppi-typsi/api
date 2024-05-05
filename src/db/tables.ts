import { query} from "./index";


export const execute = async() => {
    try {
        const res = await query(usersTable, []);
        console.log('If does not exists, table "users" is created');
    } catch (error) {
        console.error(error);
    }

    try {
        const res = await query(placesTable, []);
        console.log('If does not exists, table "places" is created');
    } catch (error) {
        console.error(error);
    }

    try {
        const res = await query(categoryTable, []);
        console.log('If does not exists, table "category" is created');
    } catch (error) {
        console.error(error);
    }

    try {
        const res = await query(typeEnum, []);
        console.log('If does not exists, enum "type" is created');
    } catch (error) {
        console.error(error);
    }

    try {
        const res = await query(drinkTable, []);
        console.log('If does not exists, table "drink" is created');
    } catch (error) {
        console.error(error);
    }

    try {
        const res = await query(ratingsTable, []);
        console.log('If does not exists, table "ratings" is created');
    } catch (error) {
        console.error(error);
    }

    try {
        const res = await query(alterTables, []);
        console.log('If not alrady, table are altered');
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

const typeEnum = `
    DO $$ BEGIN
        CREATE TYPE "volumes_t" AS ENUM ();
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;`;

const drinkTable = `CREATE TABLE IF NOT EXISTS "drink" (
    "id" serial NOT NULL,
    "name" varchar(255) NOT NULL,
    "producer" varchar(255) NOT NULL,
    "brand" varchar(255),
    "description" text,
    "product_image" varchar(255),
    "category" int NOT NULL,
    "added_on" TIMESTAMPTZ NOT NULL,
    "volumes" volumes_t[],
    "abv" float,
    "places" int,
    "nutritional_value" json,
    PRIMARY KEY("id")
    );`;

const ratingsTable = `CREATE TABLE IF NOT EXISTS "ratings" (
    "user" int NOT NULL,
    "drink" int NOT NULL,
    "rating" int
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
        WHEN duplicate_table THEN  -- postgres raises duplicate_table at surprising times. Ex.: for UNIQUE constraints.
        WHEN duplicate_object THEN
        RAISE NOTICE 'Table constraint drink_place already exists';
    END;

    BEGIN
        ALTER TABLE "drink"
        ADD CONSTRAINT "drink_category"
        FOREIGN KEY("category") REFERENCES "category"("id")
        ON UPDATE CASCADE ON DELETE CASCADE;
    EXCEPTION
        WHEN duplicate_table THEN  -- postgres raises duplicate_table at surprising times. Ex.: for UNIQUE constraints.
        WHEN duplicate_object THEN
        RAISE NOTICE 'Table constraint drink_category already exists';
    END;

    BEGIN
        ALTER TABLE "category"
        ADD CONSTRAINT "category_parent"
        FOREIGN KEY("parent") REFERENCES "category"("id")
        ON UPDATE CASCADE ON DELETE CASCADE;
    EXCEPTION
        WHEN duplicate_table THEN  -- postgres raises duplicate_table at surprising times. Ex.: for UNIQUE constraints.
        WHEN duplicate_object THEN
        RAISE NOTICE 'Table constraint category_parent already exists';
    END;

    BEGIN
        ALTER TABLE "ratings"
        ADD CONSTRAINT "rating_drink"
        FOREIGN KEY("drink") REFERENCES "drink"("id")
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION
        WHEN duplicate_table THEN  -- postgres raises duplicate_table at surprising times. Ex.: for UNIQUE constraints.
        WHEN duplicate_object THEN
        RAISE NOTICE 'Table constraint rating_drink already exists';
    END;

    BEGIN
        ALTER TABLE "ratings"
        ADD CONSTRAINT "rating_user"
        FOREIGN KEY("user") REFERENCES "users"("id")
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION
        WHEN duplicate_table THEN  -- postgres raises duplicate_table at surprising times. Ex.: for UNIQUE constraints.
        WHEN duplicate_object THEN
        RAISE NOTICE 'Table constraint rating_user already exists';
    END;

    END $$;`;

