<?php
	
#create table personas
#(
# id integer primary key autoincrement,
# name varchar(32) unique,
# header text,
# footer text,
# category varchar(32),
# status integer,
# submit varchar(32),
# approve varchar(32),
# author varchar(32),
# popularity integer
#);

#create table categories
#(
# id integer primary key autoincrement,
# name varchar(32)
#);

#create table users
#(
# username varchar(32) primary key,
# md5 varchar(32)
# email varchar(64)
#);

#create table admin
#(
# username varchar(32) primary key,
# md5 varchar(32)
#);

class PersonaStorage
{
	var $_dbh;

	function __construct($dbfile = null) 
	{
		if (!$dbfile) { $dbfile = getenv('PERSONAS_DB_FILE'); }
		try
		{
			$this->_dbh = new PDO('sqlite:' . $dbfile);
			$this->_dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
	}
	
	function get_categories()
	{
		try
		{
			$statement = 'select name from categories order by name';
			$sth = $this->_dbh->prepare($statement);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		
		$categories = array();
		
		while ($result = $sth->fetch())
		{
			$categories[] = $result[0];
		}		
		return $categories;
	}
	
	function approve_persona($id)
	{
		if (!$id) { return 0; }

		try
		{
			$statement = 'update personas set status = 1, approve = current_timestamp where id = :id';
			$sth = $this->_dbh->prepare($statement);
			$sth->bindParam(':id', $id);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		return 1;
		
	}

	function add_popularity($id)
	{
		if (!$name) { return 0; }

		try
		{
			$statement = 'update personas set popularity = popularity + 1 where name = :id';
			$sth = $this->_dbh->prepare($statement);
			$sth->bindParam(':id', $id);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		return 1;
		
	}
	
	function reject_persona($id)
	{
		if (!$id) { return 0; }
		
		try
		{
			$statement = 'update personas set status = 2, approve = current_timestamp where id = :id';
			$sth = $this->_dbh->prepare($statement);
			$sth->bindParam(':id', $id);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		return 1;
		
	}
	
	function get_persona_by_id($id)
	{
		if (!$id) { return 0; }
		try
		{
			$statement = 'select * from personas where id = :id';
			$sth = $this->_dbh->prepare($statement);
			$sth->bindParam(':id', $id);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}

		$result = $sth->fetch(PDO::FETCH_ASSOC);
		
		return $result;
	}
	
	function get_recent_personas($category = null, $limit = null)
	{
		try
		{
			$statement = 'select * from personas where status = 1' . ($category ? " and category = :category" : "") . ' order by approve desc' . ($limit ? " limit  $limit" : "");
			$sth = $this->_dbh->prepare($statement);
			if ($category)
			{
				$sth->bindParam(':category', $category);
			}
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		
		$personas = array();
		
		while ($result = $sth->fetch(PDO::FETCH_ASSOC))
		{
			$personas[] = $result;
		}		
		return $personas;
	}

	function get_popular_personas($category = null, $limit = null)
	{
		try
		{
			$statement = 'select * from personas where status = 1' . ($category ? " and category = :category" : "") . ' order by popularity desc' . ($limit ? " limit $limit" : "");
			$sth = $this->_dbh->prepare($statement);
			if ($category)
			{
				$sth->bindParam(':category', $category);
			}
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		
		$personas = array();
		
		while ($result = $sth->fetch(PDO::FETCH_ASSOC))
		{
			$personas[] = $result;
		}		
		return $personas;
	}
	
	function change_persona_category($id, $category)
	{
		try
		{
			$statement = 'update personas set category = :category where id = :id';
			$sth = $this->_dbh->prepare($statement);
			$sth->bindParam(':id', $id);
			$sth->bindParam(':category', $category);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		
		$personas = array();
		
		while ($result = $sth->fetch(PDO::FETCH_ASSOC))
		{
			$personas[] = $result;
		}		
		return $personas;
	}
	
	function get_pending_personas()
	{
		try
		{
			$statement = 'select * from personas where status = 0 order by submit';
			$sth = $this->_dbh->prepare($statement);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		
		$personas = array();
		
		while ($result = $sth->fetch(PDO::FETCH_ASSOC))
		{
			$personas[] = $result;
		}		
		return $personas;
	}
	
	
	function get_personas_by_category($category)
	{
		try
		{
			$statement = 'select * from personas where status = 1 and category = :category order by name';
			$sth = $this->_dbh->prepare($statement);
			$sth->bindParam(':category', $category);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		
		$personas = array();
		
		while ($result = $sth->fetch(PDO::FETCH_ASSOC))
		{
			$personas[] = $result;
		}		
		return $personas;
	}
	
	
	function check_persona_name($name)
	{
		try
		{
			$statement = 'select count(*) from personas where name = :name';
			$sth = $this->_dbh->prepare($statement);
			$sth->bindParam(':name', $name);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}

		return $sth->fetchColumn();			
	}
	
	
	function submit_persona($name, $category, $header, $footer, $author, $email)
	{
		try
		{
			$statement = 'insert into personas (name, status, header, footer, category, submit, author) values (:name, 0, :header, :footer, :category, current_timestamp, :author)';
			$sth = $this->_dbh->prepare($statement);
			$sth->bindParam(':name', $name);
			$sth->bindParam(':header', $header);
			$sth->bindParam(':footer', $footer);
			$sth->bindParam(':category', $category);
			$sth->bindParam(':author', $author);
			$sth->execute();
			return $this->_dbh->lastInsertId();
		}
		catch( PDOException $exception )
		{
			error_log($exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		return 0;
	}
	

	
	#stealing functions from the weave sqlite authentication class
	
	function create_user($username, $password, $email = "")
	{ 
		if (!$username)
		{
			throw new Exception("No username", 404);
		}
		if (!$password)
		{
			throw new Exception("No password", 404);
		}

		try
		{
			$insert_stmt = 'insert into users (username, md5, email) values (:username, :md5, :email)';
			$sth = $this->_dbh->prepare($insert_stmt);
			$sth->bindParam(':username', $username);
			$sth->bindParam(':md5', md5($password));
			$sth->bindParam(':email', $email);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log("create_user: " . $exception->getMessage());
			#need to add a subcatch here for user already existing
			throw new Exception("Database unavailable", 503);
		}
		return 1;
	}

	function update_password($username, $password)
	{
		if (!$username)
		{
			throw new Exception("No username", 404);
		}
		if (!$password)
		{
			throw new Exception("No password", 404);
		}

		try
		{
			$insert_stmt = 'update users set md5 = :md5 where username = :username';
			$sth = $this->_dbh->prepare($insert_stmt);
			$sth->bindParam(':username', $username);
			$sth->bindParam(':md5', md5($password));
			if ($sth->execute() == 0)
			{
				throw new Exception("User not found", 404);
			}			
		}
		catch( PDOException $exception )
		{
			error_log("update_password: " . $exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		return 1;
	
	}

	function update_email($username, $email = "")
	{
		if (!$username)
		{
			throw new Exception("No username", 404);
		}

		try
		{
			$insert_stmt = 'update users set email = :email where username = :username';
			$sth = $this->_dbh->prepare($insert_stmt);
			$sth->bindParam(':username', $username);
			$sth->bindParam(':email', $email);
			if ($sth->execute() == 0)
			{
				throw new Exception("User not found", 404);
			}
		}
		catch( PDOException $exception )
		{
			error_log("update_email: " . $exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		return 1;
	
	}

	#assume admin accounts are hand-set.
	function authenticate_admin($username, $password) 
	{
		try
		{
			$select_stmt = 'select count(*) from admin where username = :username and md5 = :md5';
			$sth = $this->_dbh->prepare($select_stmt);
			$sth->bindParam(':username', $username);
			$sth->bindParam(':md5', md5($password));
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log("authenticate_user: " . $exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}

		$result = $sth->fetchColumn();
		return $result;
	}
	

	function authenticate_user($username, $password) 
	{
		try
		{
			$select_stmt = 'select count(*) from users where username = :username and md5 = :md5';
			$sth = $this->_dbh->prepare($select_stmt);
			$sth->bindParam(':username', $username);
			$sth->bindParam(':md5', md5($password));
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log("authenticate_user: " . $exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}

		$result = $sth->fetchColumn();
		return $result;
	}
	
	function get_password_md5($username) 
	{
		try
		{
			$select_stmt = 'select md5 from users where username = :username';
			$sth = $this->_dbh->prepare($select_stmt);
			$sth->bindParam(':username', $username);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log("authenticate_user: " . $exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}

		$result = $sth->fetchColumn();
		return $result;
	}
	

	function user_exists($username) 
	{
		try
		{
			$select_stmt = 'select count(*) from users where username = :username';
			$sth = $this->_dbh->prepare($select_stmt);
			$sth->bindParam(':username', $username);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log("user_exists: " . $exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}

		$result = $sth->fetchColumn();
		return $result ? 1 : 0;
	}
	
	function delete_user($username)
	{
		if (!$username)
		{
			throw new Exception("3", 404);
		}

		try
		{
			$delete_stmt = 'delete from users where username = :username';
			$sth = $this->_dbh->prepare($delete_stmt);
			$sth->bindParam(':username', $username);
			$sth->execute();

		}
		catch( PDOException $exception )
		{
			error_log("delete_user: " . $exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		return 1;
	}

	function create_user_table()
	{
		try
		{
			$create_statement = "create table users (username text primary key, md5 text, email text)";
		
			$sth = $this->_dbh->prepare($create_statement);
			$sth->execute();
		}
		catch( PDOException $exception )
		{
			error_log("create_user_table:" . $exception->getMessage());
			throw new Exception("Database unavailable", 503);
		}
		
	}


	
}
?>