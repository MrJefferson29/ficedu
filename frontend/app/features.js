import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import axios from 'axios';

const Features = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoadingVideo, setIsLoadingVideo] = useState(true); // State for loading video

  const editDate = (createdAt) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const d = new Date(createdAt);
    return `${d.getDate()} ${monthNames[d.getMonth()]} ,${d.getFullYear()}`;
  };

  const fetchFeatures = async () => {
    try {
      const response = await axios.get('https://ficedu.onrender.com/features/get-all');
      setFeatures(response.data);
    } catch (error) {
      setError('Error fetching features');
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  // Filter based on both search term and selected category
  const filteredFeatures = features.filter(feature =>
    feature.notes.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory ? feature.category === selectedCategory : true)
  );

  const router = useRouter();
  const videoRef = useRef(null);

  const renderItem = ({ item }) => (
    <>
      <TouchableOpacity
        style={styles.card}
        accessible={true}
        onPress={() => router.push(`/culture/${item._id}`)}
      >
        <View style={styles.videoContainer}>
          {/* Video or default image based on loading state */}
          {isLoadingVideo ? (
            <Image
              source={require('../assets/images/pac.webp')} // Replace with your default image
              style={styles.video}
            />
          ) : (
            <Video
              ref={videoRef}
              source={{ uri: `${item.files[0]}` }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              isLooping
              shouldPlay={false}
              isMuted={true}
              onLoadStart={() => setIsLoadingVideo(true)} // Set loading state when the video starts loading
              onLoad={() => setIsLoadingVideo(false)} // Set loading state to false once the video is ready
            />
          )}
          <Ionicons
            name="play"
            size={40}
            style={styles.playIcon}
            accessibilityLabel="Play Video"
          />
        </View>
        <View style={styles.text}>
          <View style={styles.icon}>
            <Ionicons name="compass" size={30} color={'#D8C9AE'} />
            <Text> {item.category} </Text>
          </View>
          <Text style={styles.topic}>{item.notes}</Text>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>{editDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    </>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.addItem} onPress={() => router.push('/addFeature')}>
            <Ionicons name="add-sharp" size={20} color={'white'} />
            <Text style={{ color: 'white' }}> Add item </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === '' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('')}
          >
            <Text style={{ color: 'white' }}>All </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'History' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('History')}
          >
            <Text style={{ color: 'white' }}>History </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'Art' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('Art')}
          >
            <Text style={{ color: 'white' }}>Art and Craft </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'Dance' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('Dance')}
          >
            <Text style={{ color: 'white' }}>Music and Dance </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'Religion' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('Religion')}
          >
            <Text style={{ color: 'white' }}>Traditional Beliefs and Religions </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'Clothing' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('Clothing')}
          >
            <Text style={{ color: 'white' }}>Clothing and Textiles </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'Cuisine' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('Cuisine')}
          >
            <Text style={{ color: 'white' }}>Cuisine </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'Social' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('Social')}
          >
            <Text style={{ color: 'white' }}>Social Customs </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'Festival' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('Festival')}
          >
            <Text style={{ color: 'white' }}>Festivals and Celebrations </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'Architecture' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('Architecture')}
          >
            <Text style={{ color: 'white' }}>Architecture </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'Education' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('Education')}
          >
            <Text style={{ color: 'white' }}>Education and Knowledge </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'Medicine' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('Medicine')}
          >
            <Text style={{ color: 'white' }}>Traditional Medicine </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'Heritage' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('Heritage')}
          >
            <Text style={{ color: 'white' }}>Cultural Heritage and Identity </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, selectedCategory === 'Community' && styles.selectedFilter]}
            onPress={() => setSelectedCategory('Community')}
          >
            <Text style={{ color: 'white' }}>Community Governance </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <TouchableOpacity
        style={styles.card}
        accessible={true}
        onPress={() => router.push(`https://youtu.be/GyEdC0ckea0?si=6iyhRYsiXv0LIlGH`)}
      >
        <View style={styles.videoContainer}>
          {/* Video or default image based on loading state */}
          {isLoadingVideo ? (
            <Image
              source={require('../assets/images/pac.webp')} // Replace with your default image
              style={styles.video}
            />
          ) : (
            <Video
              ref={videoRef}
              source={require('../assets/videos/nsei.mp4')}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              isLooping
              shouldPlay={false}
              isMuted={true}
              onLoadStart={() => setIsLoadingVideo(true)} // Set loading state when the video starts loading
              onLoad={() => setIsLoadingVideo(false)} // Set loading state to false once the video is ready
            />
          )}
          <Ionicons
            name="play"
            size={40}
            style={styles.playIcon}
            accessibilityLabel="Play Video"
          />
        </View>
        <View style={styles.text}>
          <View style={styles.icon}>
            <Ionicons name="compass" size={30} color={'#D8C9AE'} />
            <Text> Bamessing Nsei Project </Text>
          </View>
          <Text style={styles.topic}> Rebuilding the Bamessing Cultural Town Center is an essential project, it reflects the together spirit and teamwork of the sons and daughters of the soil</Text>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Trending</Text>
        </View>
      </TouchableOpacity>
      <FlatList
        data={filteredFeatures}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  icon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    display: 'flex',
    flexDirection: 'column', // Changed from row to column
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  videoContainer: {
    width: '100%', // Full width for video
    height: 200, // Adjust height as necessary
    backgroundColor: '#D8C9AE',
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  video: {
    width: '100%', // Full width
    height: '100%',
    borderRadius: 8,
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    color: '#fff',
  },
  text: {
    flex: 1,
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    lineHeight: 28,
  },
  topic: {
    fontSize: 16,
    color: '#575757',
    lineHeight: 20,
    flexShrink: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxHeight: 40,
  },
  filter: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  addItem: {
    backgroundColor: '#D8C9AE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterItem: {
    backgroundColor: '#D8C9AE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedFilter: {
    backgroundColor: '#D8C9AE',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Features;
