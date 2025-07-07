import { prisma } from "@/lib/prisma";

export async function createUserIfNotExists({
    email, name, image, authType
}: {
    email: string;
    name: string;
    image: string;
    authType: "GOOGLE" | "GITHUB"
}): Promise<{isAuth: boolean, id: string}> {
    "use server"
    try {
        // Look for user by email only (since email is unique)
        const resp = await prisma.user.findUnique({where: {
            email
        }})
        
        if(resp == null) {
            // Create new user with demo flashcards
            const newUser = await prisma.user.create({
                data: {
                    authType, email, image, name
                }
            })
            
            // Create demo deck and flashcards for new user
            await createDemoFlashcards(newUser.id)
            
            return {isAuth: true, id: newUser.id}
        }
        return {isAuth: true, id: resp.id}
    } catch(error) {
        console.log(error)
        return {isAuth: false, id: ""}
    }
}

async function createDemoFlashcards(userId: string) {
    try {
        // Create demo deck
        const demoDeck = await prisma.flashcardDeck.create({
            data: {
                name: "Welcome to Memoriva - Demo Deck",
                description: "Get started with these sample flashcards to learn how Memoriva works!",
                userId: userId
            }
        })

        // Create user-deck mapping
        await prisma.userDeckMapping.create({
            data: {
                userId: userId,
                deckId: demoDeck.id,
                type: "EDITOR"
            }
        })

        // Create deck metadata
        await prisma.deckMetadata.create({
            data: {
                userId: userId,
                deckId: demoDeck.id,
                newCardCount: 20,
                reviewCardCount: 100
            }
        })

        // Create demo flashcards for the Welcome deck (5 cards)
        const welcomeCards = [
            {
                front: "What is spaced repetition?",
                back: "A learning technique that involves reviewing information at increasing intervals to improve long-term retention."
            },
            {
                front: "What does SRS stand for?",
                back: "Spaced Repetition System - an algorithm that schedules reviews based on how well you remember each card."
            },
            {
                front: "How does Memoriva help with learning?",
                back: "Memoriva uses AI-powered spaced repetition to optimize your study sessions and help you remember more effectively."
            },
            {
                front: "What happens when you mark a card as 'Easy'?",
                back: "The card will be shown again after a longer interval, as the system learns you know it well."
            },
            {
                front: "What happens when you mark a card as 'Again'?",
                back: "The card will be shown again soon, as the system knows you need more practice with it."
            }
        ]

        for (let i = 0; i < welcomeCards.length; i++) {
            const flashcard = await prisma.flashcard.create({
                data: {
                    front: welcomeCards[i].front,
                    back: welcomeCards[i].back,
                    deckId: demoDeck.id
                }
            })

            // Create SRS metadata for each card
            await prisma.sRSCardMetadata.create({
                data: {
                    userId: userId,
                    flashcardId: flashcard.id,
                    easeFactor: 2.5,
                    interval: BigInt(1),
                    repetitions: -1, // New card
                    lastReviewed: null,
                    nextReview: null
                }
            })
        }

        // Create second demo deck with 40 cards
        const largeDeck = await prisma.flashcardDeck.create({
            data: {
                name: "Computer Science Fundamentals",
                description: "Essential computer science concepts and algorithms for interviews and learning",
                userId: userId
            }
        })

        // Create user-deck mapping for large deck
        await prisma.userDeckMapping.create({
            data: {
                userId: userId,
                deckId: largeDeck.id,
                type: "EDITOR"
            }
        })

        // Create deck metadata for large deck
        await prisma.deckMetadata.create({
            data: {
                userId: userId,
                deckId: largeDeck.id,
                newCardCount: 20,
                reviewCardCount: 100
            }
        })

        // Create 40 computer science cards
        const csCards = [
            { front: "What is Big O notation?", back: "A mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity." },
            { front: "What is a stack?", back: "A linear data structure that follows the Last In First Out (LIFO) principle." },
            { front: "What is a queue?", back: "A linear data structure that follows the First In First Out (FIFO) principle." },
            { front: "What is recursion?", back: "A programming technique where a function calls itself to solve a smaller instance of the same problem." },
            { front: "What is a binary tree?", back: "A tree data structure where each node has at most two children, referred to as left and right child." },
            { front: "What is a hash table?", back: "A data structure that implements an associative array abstract data type, mapping keys to values." },
            { front: "What is dynamic programming?", back: "An algorithmic paradigm that solves complex problems by breaking them down into simpler subproblems." },
            { front: "What is a linked list?", back: "A linear collection of data elements whose order is not given by their physical placement in memory." },
            { front: "What is binary search?", back: "A search algorithm that finds the position of a target value within a sorted array." },
            { front: "What is merge sort?", back: "An efficient, stable sorting algorithm that uses a divide-and-conquer approach." },
            { front: "What is quick sort?", back: "A divide-and-conquer algorithm that sorts an array by selecting a 'pivot' element and partitioning the other elements." },
            { front: "What is a graph?", back: "A collection of nodes (vertices) connected by edges, used to represent relationships between objects." },
            { front: "What is DFS?", back: "Depth-First Search - an algorithm for traversing or searching tree or graph data structures." },
            { front: "What is BFS?", back: "Breadth-First Search - an algorithm for traversing or searching tree or graph data structures level by level." },
            { front: "What is a heap?", back: "A specialized tree-based data structure that satisfies the heap property." },
            { front: "What is encapsulation?", back: "The bundling of data and methods that operate on that data within a single unit or object." },
            { front: "What is inheritance?", back: "A mechanism where a new class inherits properties and behavior from an existing class." },
            { front: "What is polymorphism?", back: "The ability of different classes to be treated as instances of the same type through a common interface." },
            { front: "What is abstraction?", back: "The concept of hiding complex implementation details while showing only essential features." },
            { front: "What is a database index?", back: "A data structure that improves the speed of data retrieval operations on a database table." },
            { front: "What is SQL?", back: "Structured Query Language - a domain-specific language used for managing relational databases." },
            { front: "What is normalization?", back: "The process of organizing data in a database to reduce redundancy and improve data integrity." },
            { front: "What is a primary key?", back: "A unique identifier for each record in a database table." },
            { front: "What is a foreign key?", back: "A field in one table that refers to the primary key in another table." },
            { front: "What is HTTP?", back: "HyperText Transfer Protocol - an application protocol for distributed, collaborative, hypermedia information systems." },
            { front: "What is REST?", back: "Representational State Transfer - an architectural style for designing networked applications." },
            { front: "What is JSON?", back: "JavaScript Object Notation - a lightweight data-interchange format." },
            { front: "What is API?", back: "Application Programming Interface - a set of protocols and tools for building software applications." },
            { front: "What is MVC?", back: "Model-View-Controller - a software architectural pattern that separates application logic into three interconnected components." },
            { front: "What is a compiler?", back: "A program that translates source code written in a high-level programming language into machine code." },
            { front: "What is an interpreter?", back: "A program that directly executes instructions written in a programming language without requiring compilation." },
            { front: "What is version control?", back: "A system that records changes to files over time so you can recall specific versions later." },
            { front: "What is Git?", back: "A distributed version control system for tracking changes in source code during software development." },
            { front: "What is agile methodology?", back: "An iterative approach to software development that emphasizes flexibility, collaboration, and customer satisfaction." },
            { front: "What is unit testing?", back: "A software testing method where individual units or components of software are tested in isolation." },
            { front: "What is debugging?", back: "The process of finding and resolving defects or problems within a computer program." },
            { front: "What is refactoring?", back: "The process of restructuring existing code without changing its external behavior to improve readability and reduce complexity." },
            { front: "What is a design pattern?", back: "A reusable solution to a commonly occurring problem in software design." },
            { front: "What is the singleton pattern?", back: "A design pattern that restricts a class to a single instance and provides global access to that instance." },
            { front: "What is time complexity?", back: "A computational complexity that describes the amount of time an algorithm takes to run as a function of input size." }
        ]

        for (let i = 0; i < csCards.length; i++) {
            const flashcard = await prisma.flashcard.create({
                data: {
                    front: csCards[i].front,
                    back: csCards[i].back,
                    deckId: largeDeck.id
                }
            })

            // Create SRS metadata for each card
            await prisma.sRSCardMetadata.create({
                data: {
                    userId: userId,
                    flashcardId: flashcard.id,
                    easeFactor: 2.5,
                    interval: BigInt(1),
                    repetitions: -1, // New card
                    lastReviewed: null,
                    nextReview: null
                }
            })
        }

        console.log(`Created demo decks: Welcome deck with ${welcomeCards.length} cards and CS deck with ${csCards.length} cards for user ${userId}`)
    } catch (error) {
        console.error("Error creating demo flashcards:", error)
    }
}
