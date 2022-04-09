import { nanoid } from 'nanoid'

function generateNewDie() {
    return { 
      id: nanoid(),
      value: Math.ceil(Math.random() * 6), 
      isHeld: false
     }
  }

  function allNewDice() {
    const dieFaces = []
    for( let i = 1; i <= 10; i++) {
      dieFaces.push( generateNewDie() )
    }
    return dieFaces
  }

  export { generateNewDie, allNewDice }