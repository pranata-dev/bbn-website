-- Make Tryout.category nullable to support tryouts spanning all categories
ALTER TABLE "tryouts" ALTER COLUMN "category" DROP NOT NULL;
