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

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload";
const CLOUDINARY_PRESET = "YOUR_UPLOAD_PRESET";

const Skills = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [images, setImages] = useState([]);
    const [userToken, setUserToken] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false); 

    const router = useRouter();

    useEffect(() => {
        requestPermissions();
        fetchUserToken();
        fetchCourses();
    }, []);

    const requestPermissions = async () => {
        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

        if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
            Alert.alert('Permission required', 'You need to grant access to use media and camera');
        }
    };

    const fetchUserToken = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            setUserToken(token);
        } catch (error) {
            console.error('Error fetching token:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axios.post('https://ficedu.onrender.com/courses/get-all');
            setCourses(response.data.data);
        } catch (err) {
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImages([...images, ...result.assets]);
        } else {
            Alert.alert('No images selected');
        }
    };

    const uploadToCloudinary = async (imageUri) => {
        const data = new FormData();
        data.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: `image-${Date.now()}.jpg`
        });
        data.append('upload_preset', CLOUDINARY_PRESET);
        data.append('cloud_name', 'YOUR_CLOUD_NAME');

        try {
            const response = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: data,
            });

            const result = await response.json();
            return result.secure_url;
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
            return null;
        }
    };

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

        try {
            const uploadedImageUrls = await Promise.all(
                images.map(async (img) => await uploadToCloudinary(img.uri))
            );

            const validImageUrls = uploadedImageUrls.filter(url => url !== null);

            if (validImageUrls.length === 0) {
                Alert.alert('Error', 'Image upload failed. Please try again.');
                return;
            }

            const response = await fetch('https://ficedu.onrender.com/courses/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    price,
                    category,
                    images: validImageUrls,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Course added successfully');
                router.push('/categories');
                setName('');
                setPrice('');
                setCategory('');
                setImages([]);
                setIsFormVisible(false);
            } else {
                Alert.alert('Error', data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Unable to add course. Please try again later.');
        }
    };

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
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
                            source={{ uri: `${item.images[0]}` }}
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

            <Pressable onPress={toggleFormVisibility} style={styles.toggleButton}>
                <Text style={styles.toggleButtonText}>Add Course</Text>
            </Pressable>

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
    container: { flex: 1, padding: 10, backgroundColor: '#f8f9fa' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    error: { color: 'red', fontSize: 16 },
    toggleButton: { padding: 10, backgroundColor: '#007bff', alignItems: 'center', marginVertical: 10, borderRadius: 5 },
    toggleButtonText: { color: '#fff', fontSize: 16 },
});

export default Skills;
