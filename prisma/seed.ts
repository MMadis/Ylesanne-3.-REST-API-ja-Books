import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const fantasy = await prisma.genre.upsert({ where: { name: "Fantasy" }, update: {}, create: { name: "Fantasy" } });
  const dystopian = await prisma.genre.upsert({ where: { name: "Dystopian" }, update: {}, create: { name: "Dystopian" } });
  const classic = await prisma.genre.upsert({ where: { name: "Classic" }, update: {}, create: { name: "Classic" } });
  const mystery = await prisma.genre.upsert({ where: { name: "Mystery" }, update: {}, create: { name: "Mystery" } });
  const satire = await prisma.genre.upsert({ where: { name: "Satire" }, update: {}, create: { name: "Satire" } });

  const rowling = await prisma.author.create({
    data: {
      firstName: "J.K.",
      lastName: "Rowling",
      birthYear: 1965,
      nationality: "British",
      biography: "Author of Harry Potter series.",
    },
  });

  const bloomsbury = await prisma.publisher.create({
    data: {
      name: "Bloomsbury",
      country: "United Kingdom",
      foundedYear: 1986,
      website: "https://www.bloomsbury.com",
    },
  });

  const hp1 = await prisma.book.create({
    data: {
      title: "Harry Potter and the Philosopher's Stone",
      isbn: "9780747532699",
      publishedYear: 1997,
      pageCount: 223,
      language: "English",
      description: "First Harry Potter novel.",
      authorId: rowling.id,
      publisherId: bloomsbury.id,
      genres: { connect: [{ id: fantasy.id }, { id: classic.id }] },
    },
  });

  await prisma.book.create({
    data: {
      title: "1984",
      isbn: "9780451524935",
      publishedYear: 1949,
      pageCount: 328,
      language: "English",
      description: "Dystopian social science fiction novel.",
      author: {
        create: {
          firstName: "George",
          lastName: "Orwell",
          birthYear: 1903,
          nationality: "British",
          biography: "Known for dystopian fiction.",
        },
      },
      publisher: {
        create: {
          name: "Penguin Books",
          country: "United Kingdom",
          foundedYear: 1935,
          website: "https://www.penguin.com",
        },
      },
      genres: { connect: [{ id: dystopian.id }, { id: satire.id }] },
    },
  });

  await prisma.review.createMany({
    data: [
      { bookId: hp1.id, userName: "alice", rating: 5, comment: "Magical and fun." },
      { bookId: hp1.id, userName: "bob", rating: 4, comment: "Great start to the series." },
      { bookId: hp1.id, userName: "charlie", rating: 5, comment: "Excellent." },
      { bookId: hp1.id, userName: "diana", rating: 5, comment: "Loved it." },
      { bookId: hp1.id, userName: "eve", rating: 4, comment: "Would read again." },
      { bookId: hp1.id, userName: "frank", rating: 5, comment: "Classic." },
      { bookId: hp1.id, userName: "grace", rating: 4, comment: "Nice pacing." },
      { bookId: hp1.id, userName: "henry", rating: 5, comment: "Great characters." },
      { bookId: hp1.id, userName: "irene", rating: 5, comment: "A favorite." },
      { bookId: hp1.id, userName: "john", rating: 4, comment: "Solid read." },
    ],
  });

  await prisma.genre.update({ where: { id: mystery.id }, data: {} });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
