import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create your user account
  const user = await prisma.user.upsert({
    where: { email: 'devyk100@gmail.com' },
    update: {},
    create: {
      email: 'devyk100@gmail.com',
      name: 'Devy K',
      authType: 'GOOGLE',
    },
  });

  console.log('✅ Created user:', user.email);

  // Delete existing decks to start fresh
  await prisma.flashcard.deleteMany();
  await prisma.flashcardDeck.deleteMany();

  // Create Demo Deck 1: Computer Science Fundamentals (45 cards)
  const csDeck = await prisma.flashcardDeck.create({
    data: {
      name: 'Computer Science Fundamentals',
      description: 'Essential computer science concepts and algorithms',
      userId: user.id,
      isTemplate: true, // Mark as template for copying to new users
    },
  });

  console.log('✅ Created CS Fundamentals deck');

  // CS Fundamentals cards (45 cards)
  const csCards = [
    // Data Structures
    { front: 'What is a Stack?', back: 'A Last-In-First-Out (LIFO) data structure where elements are added and removed from the same end called the top.' },
    { front: 'What is a Queue?', back: 'A First-In-First-Out (FIFO) data structure where elements are added at the rear and removed from the front.' },
    { front: 'What is a Linked List?', back: 'A linear data structure where elements are stored in nodes, and each node contains data and a reference to the next node.' },
    { front: 'What is a Binary Tree?', back: 'A hierarchical data structure where each node has at most two children, referred to as left and right child.' },
    { front: 'What is a Hash Table?', back: 'A data structure that implements an associative array using a hash function to compute an index for keys.' },
    { front: 'What is a Heap?', back: 'A complete binary tree where parent nodes are either greater than (max heap) or less than (min heap) their children.' },
    { front: 'What is a Graph?', back: 'A collection of vertices (nodes) connected by edges, used to represent relationships between objects.' },
    { front: 'What is an Array?', back: 'A collection of elements stored in contiguous memory locations, accessed by index.' },
    
    // Algorithms
    { front: 'What is Binary Search?', back: 'A search algorithm that finds a target value in a sorted array by repeatedly dividing the search interval in half.' },
    { front: 'What is Bubble Sort?', back: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.' },
    { front: 'What is Quick Sort?', back: 'A divide-and-conquer sorting algorithm that picks a pivot element and partitions the array around it.' },
    { front: 'What is Merge Sort?', back: 'A divide-and-conquer algorithm that divides the array into halves, sorts them, and then merges them back together.' },
    { front: 'What is Depth-First Search (DFS)?', back: 'A graph traversal algorithm that explores as far as possible along each branch before backtracking.' },
    { front: 'What is Breadth-First Search (BFS)?', back: 'A graph traversal algorithm that explores all vertices at the current depth before moving to vertices at the next depth.' },
    { front: 'What is Dynamic Programming?', back: 'An optimization technique that solves complex problems by breaking them down into simpler subproblems and storing results.' },
    { front: 'What is Greedy Algorithm?', back: 'An algorithmic approach that makes the locally optimal choice at each step, hoping to find a global optimum.' },
    
    // Time Complexity
    { front: 'What is Big O Notation?', back: 'A mathematical notation used to describe the upper bound of an algorithm\'s time or space complexity in the worst case.' },
    { front: 'What is O(1) complexity?', back: 'Constant time complexity - the algorithm takes the same amount of time regardless of input size.' },
    { front: 'What is O(n) complexity?', back: 'Linear time complexity - the algorithm\'s runtime grows linearly with the input size.' },
    { front: 'What is O(log n) complexity?', back: 'Logarithmic time complexity - the algorithm\'s runtime grows logarithmically with the input size.' },
    { front: 'What is O(n²) complexity?', back: 'Quadratic time complexity - the algorithm\'s runtime grows quadratically with the input size.' },
    
    // Programming Concepts
    { front: 'What is Recursion?', back: 'A programming technique where a function calls itself to solve a smaller instance of the same problem.' },
    { front: 'What is Object-Oriented Programming?', back: 'A programming paradigm based on the concept of objects, which contain data (attributes) and code (methods).' },
    { front: 'What is Encapsulation?', back: 'The bundling of data and methods that operate on that data within a single unit, hiding internal implementation details.' },
    { front: 'What is Inheritance?', back: 'A mechanism that allows a class to inherit properties and methods from another class.' },
    { front: 'What is Polymorphism?', back: 'The ability of objects of different types to be treated as instances of the same type through a common interface.' },
    { front: 'What is Abstraction?', back: 'The process of hiding complex implementation details while showing only essential features of an object.' },
    
    // Database Concepts
    { front: 'What is a Primary Key?', back: 'A unique identifier for each record in a database table that cannot be null and must be unique.' },
    { front: 'What is a Foreign Key?', back: 'A field in one table that refers to the primary key in another table, establishing a link between the tables.' },
    { front: 'What is Normalization?', back: 'The process of organizing data in a database to reduce redundancy and improve data integrity.' },
    { front: 'What is SQL?', back: 'Structured Query Language - a programming language designed for managing and manipulating relational databases.' },
    { front: 'What is a JOIN in SQL?', back: 'An operation that combines rows from two or more tables based on a related column between them.' },
    
    // Network Concepts
    { front: 'What is HTTP?', back: 'HyperText Transfer Protocol - an application protocol for distributed, collaborative, hypermedia information systems.' },
    { front: 'What is TCP/IP?', back: 'Transmission Control Protocol/Internet Protocol - the fundamental communication protocols of the internet.' },
    { front: 'What is DNS?', back: 'Domain Name System - a hierarchical system that translates human-readable domain names to IP addresses.' },
    { front: 'What is REST API?', back: 'Representational State Transfer - an architectural style for designing networked applications using HTTP methods.' },
    
    // Operating Systems
    { front: 'What is a Process?', back: 'An instance of a program in execution, containing the program code and its current activity.' },
    { front: 'What is a Thread?', back: 'The smallest unit of processing that can be performed in an OS, existing within a process.' },
    { front: 'What is Deadlock?', back: 'A situation where two or more processes are unable to proceed because each is waiting for the other to release resources.' },
    { front: 'What is Virtual Memory?', back: 'A memory management technique that provides an idealized abstraction of storage resources.' },
    
    // Software Engineering
    { front: 'What is Version Control?', back: 'A system that records changes to files over time so you can recall specific versions later.' },
    { front: 'What is Agile Development?', back: 'An iterative approach to software development that emphasizes flexibility, collaboration, and customer feedback.' },
    { front: 'What is Test-Driven Development?', back: 'A software development approach where tests are written before the actual code implementation.' },
    { front: 'What is Code Review?', back: 'A systematic examination of source code intended to find bugs and improve code quality.' },
    { front: 'What is Continuous Integration?', back: 'A development practice where developers integrate code into a shared repository frequently.' },
    { front: 'What is Design Pattern?', back: 'A reusable solution to a commonly occurring problem in software design and development.' },
    { front: 'What is MVC Architecture?', back: 'Model-View-Controller - a software design pattern that separates application logic into three interconnected components.' },
  ];

  // Insert CS cards
  for (let i = 0; i < csCards.length; i++) {
    await prisma.flashcard.create({
      data: {
        front: csCards[i].front,
        back: csCards[i].back,
        deckId: csDeck.id,
        order: i + 1,
      },
    });
  }

  console.log(`✅ Created ${csCards.length} CS Fundamentals cards`);

  // Create Demo Deck 2: Quick Math Facts (5 cards)
  const mathDeck = await prisma.flashcardDeck.create({
    data: {
      name: 'Quick Math Facts',
      description: 'Essential mathematical concepts and formulas',
      userId: user.id,
      isTemplate: true, // Mark as template for copying to new users
    },
  });

  console.log('✅ Created Quick Math Facts deck');

  // Math cards (5 cards)
  const mathCards = [
    { front: 'What is the Pythagorean Theorem?', back: 'a² + b² = c², where c is the hypotenuse of a right triangle and a and b are the other two sides.' },
    { front: 'What is the quadratic formula?', back: 'x = (-b ± √(b² - 4ac)) / 2a, used to solve quadratic equations of the form ax² + bx + c = 0.' },
    { front: 'What is the derivative of x²?', back: '2x. The power rule states that d/dx(xⁿ) = n·xⁿ⁻¹.' },
    { front: 'What is the area of a circle?', back: 'A = πr², where r is the radius of the circle.' },
    { front: 'What is Euler\'s identity?', back: 'e^(iπ) + 1 = 0, considered one of the most beautiful equations in mathematics.' },
  ];

  // Insert Math cards
  for (let i = 0; i < mathCards.length; i++) {
    await prisma.flashcard.create({
      data: {
        front: mathCards[i].front,
        back: mathCards[i].back,
        deckId: mathDeck.id,
        order: i + 1,
      },
    });
  }

  console.log(`✅ Created ${mathCards.length} Quick Math Facts cards`);

  console.log('🎉 Database seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - User: ${user.email}`);
  console.log(`   - Decks: 2 (${csCards.length} + ${mathCards.length} cards total)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
