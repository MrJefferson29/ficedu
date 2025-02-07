import React, { useEffect, useState } from 'react';
import { 
    View, Text, FlatList, ActivityIndicator, StyleSheet, 
    ImageBackground, Pressable, TextInput, Button, Image, Alert 
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Skills = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [images, setImages] = useState([]);
    const [userToken, setUserToken] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false); // State for controlling form visibility

    const router = useRouter();

    useEffect(() => {
        requestPermissions();
        fetchUserToken();
        fetchCourses();
    }, []);

    // Request media & camera permissions
    const requestPermissions = async () => {
        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

        if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
            Alert.alert('Permission required', 'You need to grant access to use media and camera');
        }
    };

    // Retrieve user token
    const fetchUserToken = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            setUserToken(token);
        } catch (error) {
            console.error('Error fetching token:', error);
        }
    };

    // Fetch courses from API
    const fetchCourses = async () => {
        try {
            const response = await axios.post('http://192.168.33.100:5000/courses/get-all');
            setCourses(response.data.data);
        } catch (err) {
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    // Open image picker
    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImages([...images, ...result.assets]); // Append selected images
        } else {
            Alert.alert('No images selected');
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!name || !price || !category || images.length === 0) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (isNaN(price)) {
            Alert.alert('Invalid price', 'Please enter a valid number for price');
            return;
        }

        if (!userToken) {
            Alert.alert('Error', 'Authentication required');
            return;
        }

        const formData = new FormData();
        images.forEach((image, index) => {
            formData.append('images', {
                uri: image.uri,
                name: `image-${index}.jpg`,
                type: 'image/jpeg',
            });
        });
        formData.append('name', name);
        formData.append('price', price);
        formData.append('category', category);

        try {
            const response = await fetch('http://192.168.33.100:5000/courses/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Item added successfully');
                router.push('/categories');
                setName('');
                setPrice('');
                setCategory('');
                setImages([]);
                setIsFormVisible(false); // Close the form after submission
            } else {
                Alert.alert('Error', data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Unable to add item. Please try again later.');
        }
    };

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible); // Toggle visibility of the form
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={courses}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <Pressable onPress={() => router.push({
                        pathname: `/videos/${item._id}`,
                        params: { heading: item.name },
                    })}>
                        <ImageBackground
                            source={{ uri: `http://192.168.33.100:5000/${item.images[0]}` }}
                            style={styles.card}
                            imageStyle={styles.imageBackground}
                        >
                            <View style={styles.overlay}>
                                <Text style={styles.courseName}>{item.name}</Text>
                                <Text style={styles.category}>{item.category}</Text>
                                <Text style={styles.price}>XAF {item.price}</Text>
                            </View>
                        </ImageBackground>
                    </Pressable>
                )}
            />
            {/* Toggle button */}
            <Pressable onPress={toggleFormVisibility} style={styles.toggleButton}>
                <Text style={styles.toggleButtonText}>Add Course</Text>
            </Pressable>

            {/* Form Dropdown */}
            {isFormVisible && (
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Item Name"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Price"
                        value={price}
                        keyboardType="numeric"
                        onChangeText={setPrice}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Category"
                        value={category}
                        onChangeText={setCategory}
                    />
                    <Button title="Pick Images" onPress={pickImages} />
                    <View style={styles.imagePreview}>
                        {images.length > 0 ? (
                            images.map((image, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: image.uri }}
                                    style={styles.image}
                                />
                            ))
                        ) : (
                            <Text>No images selected</Text>
                        )}
                    </View>
                    <Button title="Add Item" onPress={handleSubmit} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f8f9fa',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
        fontSize: 16,
    },
    card: {
        height: 150,
        marginBottom: 10,
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    imageBackground: {
        borderRadius: 10,
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 15,
    },
    courseName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    category: {
        fontSize: 14,
        color: '#f8f9fa',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFD700',
        marginTop: 5,
    },
    input: {
        borderWidth: 1,
        padding: 8,
        marginVertical: 5,
        borderRadius: 5,
    },
    imagePreview: {
        flexDirection: 'row',
        marginVertical: 10,
    },
    image: {
        width: 50,
        height: 50,
        marginRight: 5,
    },
    formContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    toggleButton: {
        padding: 10,
        backgroundColor: '#007bff',
        alignItems: 'center',
        marginVertical: 10,
        borderRadius: 5,
    },
    toggleButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default Skills;
