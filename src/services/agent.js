const searchUsers = async (actor, username) => {
  try {
    return await actor.user_search(username);
  } catch (e) {
    throw new Error(e.message);
  }
};

export default { searchUsers };
